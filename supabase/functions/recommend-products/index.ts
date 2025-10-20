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

    const prompt = `You are a baby product recommendation expert. Analyze the following baby/pregnancy information and available products to provide personalized product recommendations.

Context: ${context}
Current season/month: ${currentMonth}
${budgetContext}

INTERNAL MARKETPLACE PRODUCTS (used/secondhand from local sellers):
${listings?.map(l => `[MARKETPLACE] ID: ${l.id} | ${l.title} | Category: ${l.category} | Age Range: ${l.age_range || 'Not specified'} | Condition: ${l.condition} | Price: $${l.price} | Description: ${l.description.substring(0, 100)}`).join('\n')}

AFFILIATE PRODUCTS (new items from retailers):
${awinProducts?.map(p => `[AFFILIATE] ID: ${p.id} | ${p.product_name} | Merchant: ${p.merchant_name} | Category: ${p.category || 'Not specified'} | Age Range: ${p.age_range} | Brand: ${p.brand || 'N/A'} | Price: $${p.price} | Stock: ${p.stock_status}`).join('\n')}

Provide 12-15 highly relevant product recommendations mixing both sources.

Guidelines:
1. Consider the baby's developmental stage and upcoming milestones
2. Consider seasonal appropriateness and urgency
3. Mix recommendations: 40% marketplace (budget-friendly), 60% affiliate (new items)
4. For lower income/budget users, prioritize marketplace products
5. For higher income users, include more affiliate products with premium brands
6. Match safety requirements for the baby's age

Return ONLY a JSON array with this exact structure:
[
  {
    "product_id": "uuid-here",
    "source": "marketplace" OR "affiliate",
    "relevance_score": 95,
    "reason": "Perfect for tummy time - essential for the rolling over milestone you're approaching.",
    "urgency": "high"
  }
]

- product_id: Use the ID from either MARKETPLACE or AFFILIATE list
- source: MUST be exactly "marketplace" or "affiliate" 
- relevance_score: 0-100 based on how well it matches needs
- reason: 1-2 sentences explaining why recommended now
- urgency: "high" (needed now), "medium" (2-4 weeks), "low" (nice to have)`;

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
          { role: 'system', content: 'You are a baby product recommendation expert. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
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
    
    // Extract JSON from response (handle markdown code blocks)
    let recommendations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
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