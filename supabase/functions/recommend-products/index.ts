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
      .limit(50);

    if (listingsError) throw listingsError;

    // Prepare context for AI
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const context = isPregnancy 
      ? `Pregnancy week ${pregnancyWeek}, expecting parent needs`
      : `Baby age: ${babyAge}. Completed milestones: ${completedMilestones.join(', ')}. Upcoming milestones: ${upcomingMilestones.join(', ')}.`;

    const prompt = `You are a baby product recommendation expert. Analyze the following baby/pregnancy information and marketplace listings to provide personalized product recommendations.

Context: ${context}
Current season/month: ${currentMonth}

Available Products:
${listings?.map(l => `ID: ${l.id} | ${l.title} | Category: ${l.category} | Age Range: ${l.age_range || 'Not specified'} | Condition: ${l.condition} | Price: $${l.price} | Description: ${l.description.substring(0, 100)}`).join('\n')}

Provide 5-8 highly relevant product recommendations. For each recommendation:
1. Consider the baby's developmental stage and upcoming milestones
2. Consider seasonal appropriateness (current month: ${currentMonth})
3. Consider urgency (needed now vs. needed soon)
4. Consider safety for the baby's age
5. Prioritize items that match the baby's needs

Return ONLY a JSON array with this exact structure:
[
  {
    "listing_id": "uuid-here",
    "relevance_score": 95,
    "reason": "Perfect for tummy time - essential for the rolling over milestone you're approaching. Provides safe, cushioned space for practice.",
    "urgency": "high"
  }
]

Relevance score: 0-100 based on how well it matches needs.
Reason: 1-2 sentences explaining why this specific product is recommended now.
Urgency: "high" (needed now), "medium" (needed in 2-4 weeks), "low" (nice to have).`;

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

    // Store recommendations in database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      user_id: user.id,
      listing_id: rec.listing_id,
      relevance_score: rec.relevance_score,
      reason: rec.reason,
      urgency: rec.urgency || 'normal',
    }));

    const { error: insertError } = await supabase
      .from('product_recommendations')
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error('Error inserting recommendations:', insertError);
    }

    // Return recommendations with listing details
    const enrichedRecommendations = recommendations.map((rec: any) => {
      const listing = listings?.find(l => l.id === rec.listing_id);
      return {
        ...rec,
        listing,
      };
    });

    return new Response(JSON.stringify({ recommendations: enrichedRecommendations }), {
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