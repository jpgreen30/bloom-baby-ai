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
    console.log('Starting preload-recommendations job...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Find babies needing recommendation refresh
    const { data: babies, error: babiesError } = await supabase
      .from('babies')
      .select('*, profiles!inner(id)')
      .or('recommendation_refresh_needed.eq.true,last_recommendation_generated.is.null,last_recommendation_generated.lt.' + new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(50);

    if (babiesError) throw babiesError;
    
    console.log(`Found ${babies?.length || 0} babies needing recommendations`);

    if (!babies || babies.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No babies need recommendation updates',
        processed: 0 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get active marketplace listings
    const { data: listings, error: listingsError } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('status', 'active')
      .limit(50);

    if (listingsError) throw listingsError;

    let successCount = 0;
    let errorCount = 0;

    // Process each baby
    for (const baby of babies) {
      try {
        console.log(`Processing recommendations for baby: ${baby.id}`);
        
        // Get milestones for this baby
        const { data: babyMilestones } = await supabase
          .from('baby_milestones')
          .select('*, milestone:milestones(*)')
          .eq('baby_id', baby.id);

        const { data: allMilestones } = await supabase
          .from('milestones')
          .select('*')
          .order('typical_age_weeks');

        const completedMilestones = babyMilestones?.filter(bm => bm.status === 'achieved')
          .map(bm => bm.milestone?.title || '') || [];
        
        const birthDate = new Date(baby.birthdate);
        const today = new Date();
        const ageInWeeks = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        const upcomingMilestones = allMilestones?.filter(m => 
          m.typical_age_weeks >= ageInWeeks && 
          !babyMilestones?.find(bm => bm.milestone_id === m.id && bm.status === 'achieved')
        ).slice(0, 5).map(m => m.title) || [];

        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const context = baby.is_pregnancy 
          ? `Pregnancy week ${baby.pregnancy_week}, expecting parent needs`
          : `Baby age: ${Math.floor(ageInWeeks / 4)} months (${ageInWeeks} weeks). Completed milestones: ${completedMilestones.join(', ')}. Upcoming milestones: ${upcomingMilestones.join(', ')}.`;

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
          console.error(`AI API error for baby ${baby.id}: ${aiResponse.status}`);
          errorCount++;
          continue;
        }

        const aiData = await aiResponse.json();
        const content = aiData.choices[0].message.content;
        
        // Extract JSON from response
        let recommendations;
        try {
          const jsonMatch = content.match(/\[[\s\S]*\]/);
          recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
        } catch (e) {
          console.error(`Failed to parse AI response for baby ${baby.id}`);
          errorCount++;
          continue;
        }

        // Delete old recommendations for this user (keep last 7 days)
        await supabase
          .from('product_recommendations')
          .delete()
          .eq('user_id', baby.user_id)
          .lt('recommended_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

        // Store recommendations
        const recommendationsToInsert = recommendations.map((rec: any) => ({
          user_id: baby.user_id,
          listing_id: rec.listing_id,
          relevance_score: rec.relevance_score,
          reason: rec.reason,
          urgency: rec.urgency || 'normal',
        }));

        const { error: insertError } = await supabase
          .from('product_recommendations')
          .insert(recommendationsToInsert);

        if (insertError) {
          console.error(`Error inserting recommendations for baby ${baby.id}:`, insertError);
          errorCount++;
          continue;
        }

        // Update baby record
        await supabase
          .from('babies')
          .update({
            last_recommendation_generated: new Date().toISOString(),
            recommendation_refresh_needed: false,
          })
          .eq('id', baby.id);

        successCount++;
        console.log(`Successfully processed baby ${baby.id}`);
        
      } catch (error) {
        console.error(`Error processing baby ${baby.id}:`, error);
        errorCount++;
      }
    }

    return new Response(JSON.stringify({ 
      message: 'Preload job completed',
      total: babies.length,
      success: successCount,
      errors: errorCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in preload-recommendations:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
