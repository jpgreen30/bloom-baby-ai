import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { babyAge, isPregnancy, pregnancyWeek, completedMilestones, upcomingMilestones, forceRefresh = false } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user ID from auth header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token || '');
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check for existing fresh recommendations (if not forcing refresh)
    if (!forceRefresh) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: existingRecs, error: recError } = await supabase
        .from('product_recommendations')
        .select('*, listing:marketplace_listings(*)')
        .eq('user_id', user.id)
        .gte('recommended_at', oneDayAgo)
        .order('relevance_score', { ascending: false })
        .limit(10);

      if (!recError && existingRecs && existingRecs.length > 0) {
        console.log('Returning existing recommendations from database');
        return new Response(JSON.stringify({ 
          recommendations: existingRecs,
          cached: true 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }
    
    // Get active marketplace listings
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .limit(30);

    if (listingsError) throw listingsError;

    // Get Awin affiliate products
    const { data: awinProducts, error: awinError } = await supabase
      .from('awin_products')
      .select('*')
      .order('last_synced', { ascending: false })
      .limit(50);

    if (awinError) console.error('Error fetching Awin products:', awinError);

    // Get user profile for budget/income data
    const { data: profile } = await supabase
      .from('profiles')
      .select('household_income, baby_budget_monthly, housing_status')
      .eq('id', user.id)
      .single();

    const budgetContext = profile ? `
User Budget Context:
- Household Income: ${profile.household_income || 'not specified'}
- Monthly Baby Budget: ${profile.baby_budget_monthly || 'not specified'}
- Housing: ${profile.housing_status || 'not specified'}
` : '';

    // Prepare context for AI
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const context = isPregnancy 
      ? `Pregnancy week ${pregnancyWeek}, expecting parent needs`
      : `Baby age: ${babyAge}. Completed milestones: ${completedMilestones.join(', ')}. Upcoming milestones: ${upcomingMilestones.join(', ')}.`;

    const productList = [
      ...(listings?.map(l => ({
        id: l.id,
        source: 'marketplace',
        name: l.title,
        category: l.category,
        age_range: l.age_range || 'Not specified',
        price: l.price,
        condition: l.condition,
        description: l.description.substring(0, 100)
      })) || []),
      ...(awinProducts?.map(p => ({
        id: p.id,
        source: 'affiliate',
        name: p.product_name,
        merchant: p.merchant_name,
        category: p.category || 'Not specified',
        age_range: p.age_range,
        brand: p.brand || 'N/A',
        price: p.price,
        stock: p.stock_status
      })) || [])
    ];

    const prompt = `Task: Select 12-15 products from the provided list below that are most relevant for this parent.

Parent Context: ${context}
Season: ${currentMonth}
${budgetContext}

AVAILABLE PRODUCTS (select from these ONLY):
${productList.map(p => JSON.stringify(p)).join('\n')}

Selection Guidelines:
- Prioritize products matching baby's current developmental stage
- Consider seasonal relevance (month: ${currentMonth})
- Mix 40% marketplace (used/affordable) + 60% affiliate (new/premium)
- Lower budget users: prefer marketplace. Higher budget: prefer affiliate
- Match age_range to baby's age/stage

Output Format: Return ONLY a valid JSON array (no markdown, no explanations):
[
  {
    "product_id": "actual-uuid-from-list",
    "source": "marketplace",
    "relevance_score": 92,
    "reason": "Specific reason why this product is perfect right now.",
    "urgency": "high"
  }
]

Rules:
- product_id MUST be an actual id from the AVAILABLE PRODUCTS list above
- source MUST be "marketplace" or "affiliate" (matching the product's source)
- relevance_score: 0-100
- urgency: "high", "medium", or "low"
- Output ONLY the JSON array, nothing else`;

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a product selection assistant. You MUST respond with ONLY a valid JSON array. No explanations, no markdown formatting, no code blocks. Just the raw JSON array starting with [ and ending with ].' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits depleted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI Response:', content.substring(0, 500));
    
    // Extract JSON from response (handle various formats)
    let recommendations;
    try {
      // Try parsing directly first
      try {
        recommendations = JSON.parse(content);
      } catch {
        // Try extracting JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/) || 
                         content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('No JSON array found in response');
        }
      }
      
      // Validate it's an array
      if (!Array.isArray(recommendations)) {
        throw new Error('Response is not an array');
      }
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      console.error('Parse error:', e);
      throw new Error(`Invalid AI response format: ${e instanceof Error ? e.message : 'Unknown error'}`);
    }

    // Separate and enrich recommendations by source
    const marketplaceRecs = [];
    const affiliateRecs = [];

    for (const rec of recommendations) {
      if (rec.source === 'marketplace') {
        const listing = listings?.find(l => l.id === rec.product_id);
        if (listing) {
          marketplaceRecs.push({
            ...rec,
            listing_id: rec.product_id,
            listing,
          });
        }
      } else if (rec.source === 'affiliate') {
        const awinProduct = awinProducts?.find(p => p.id === rec.product_id);
        if (awinProduct) {
          affiliateRecs.push({
            ...rec,
            awin_product_id: rec.product_id,
            product: awinProduct,
          });
        }
      }
    }

    // Insert marketplace recommendations
    if (marketplaceRecs.length > 0) {
      const marketplaceInserts = marketplaceRecs.map(rec => ({
        user_id: user.id,
        listing_id: rec.listing_id,
        relevance_score: rec.relevance_score,
        reason: rec.reason,
        urgency: ['high', 'medium', 'low'].includes(rec.urgency) ? rec.urgency : 'medium',
      }));

      const { error: mpError } = await supabase
        .from('product_recommendations')
        .insert(marketplaceInserts);

      if (mpError) console.error('Error inserting marketplace recommendations:', mpError);
    }

    // Insert affiliate recommendations
    if (affiliateRecs.length > 0) {
      const affiliateInserts = affiliateRecs.map(rec => ({
        user_id: user.id,
        awin_product_id: rec.awin_product_id,
        relevance_score: rec.relevance_score,
        reason: rec.reason,
        urgency: ['high', 'medium', 'low'].includes(rec.urgency) ? rec.urgency : 'medium',
      }));

      const { error: afError } = await supabase
        .from('awin_recommendations')
        .insert(affiliateInserts);

      if (afError) console.error('Error inserting affiliate recommendations:', afError);
    }

    // Return combined recommendations
    const allRecommendations = [
      ...marketplaceRecs.map(r => ({ ...r, source: 'marketplace' })),
      ...affiliateRecs.map(r => ({ ...r, source: 'affiliate' })),
    ].sort((a, b) => b.relevance_score - a.relevance_score);

    return new Response(JSON.stringify({ 
      recommendations: allRecommendations,
      marketplaceCount: marketplaceRecs.length,
      affiliateCount: affiliateRecs.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in recommend-products:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});