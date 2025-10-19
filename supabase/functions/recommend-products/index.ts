import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { babyId } = await req.json();

    // Fetch baby data with milestones
    const { data: baby, error: babyError } = await supabase
      .from('babies')
      .select('*, baby_milestones(milestone_id, status, achieved_at)')
      .eq('id', babyId)
      .single();

    if (babyError) throw babyError;

    // Fetch active marketplace listings
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .limit(50);

    if (listingsError) throw listingsError;

    // Calculate baby's age in weeks
    const birthdate = new Date(baby.birthdate);
    const now = new Date();
    const ageInWeeks = Math.floor((now.getTime() - birthdate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    const isPregnancy = baby.is_pregnancy;
    const pregnancyWeek = baby.pregnancy_week || 0;

    // Get achieved milestone IDs
    const achievedMilestones = baby.baby_milestones
      ?.filter((m: any) => m.status === 'achieved')
      .map((m: any) => m.milestone_id) || [];

    // Prepare AI prompt
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const season = ['December', 'January', 'February'].includes(currentMonth) ? 'winter' :
                   ['March', 'April', 'May'].includes(currentMonth) ? 'spring' :
                   ['June', 'July', 'August'].includes(currentMonth) ? 'summer' : 'fall';

    const prompt = `You are a baby product recommendation expert. Analyze these products and recommend the top 5 most relevant items.

Baby Information:
- ${isPregnancy ? `Pregnancy week: ${pregnancyWeek}` : `Age: ${ageInWeeks} weeks`}
- Achieved milestones count: ${achievedMilestones.length}
- Current season: ${season}

Available Products (JSON):
${JSON.stringify(listings.slice(0, 20), null, 2)}

Return ONLY a valid JSON array with exactly 5 recommendations. Each recommendation must have:
- listing_id (UUID from the products)
- relevance_score (0-100)
- reason (one sentence explaining why this is needed now)

Format: [{"listing_id": "uuid", "relevance_score": 95, "reason": "explanation"}, ...]`;

    console.log('Calling Lovable AI for recommendations...');

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a product recommendation engine. Always return valid JSON only.' },
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
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error('AI API request failed');
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    console.log('AI Response:', content);

    // Parse AI response
    let recommendations;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in response');
      }
      recommendations = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      throw new Error('Invalid AI response format');
    }

    // Save recommendations to database
    const recommendationsToInsert = recommendations.map((rec: any) => ({
      user_id: user.id,
      listing_id: rec.listing_id,
      relevance_score: rec.relevance_score,
      reason: rec.reason,
    }));

    // Delete old recommendations for this user
    await supabase
      .from('product_recommendations')
      .delete()
      .eq('user_id', user.id);

    // Insert new recommendations
    const { error: insertError } = await supabase
      .from('product_recommendations')
      .insert(recommendationsToInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
