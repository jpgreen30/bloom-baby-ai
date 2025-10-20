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
    const { baby_id, date_range_days = 7 } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch baby data
    const { data: baby } = await supabase
      .from("babies")
      .select("*, baby_milestones(*, milestone:milestones(*))")
      .eq("id", baby_id)
      .single();

    if (!baby) {
      return new Response(
        JSON.stringify({ summary: "Welcome! Let's track your baby's journey." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recent milestones (last 7 days)
    const recentMilestones = baby.baby_milestones?.filter((bm: any) => {
      if (!bm.achieved_at) return false;
      const daysDiff = (Date.now() - new Date(bm.achieved_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= date_range_days;
    }) || [];

    // Calculate baby age
    let ageDescription = "";
    if (baby.is_pregnancy) {
      ageDescription = `${baby.pregnancy_week} weeks pregnant`;
    } else if (baby.birthdate) {
      const months = Math.floor((Date.now() - new Date(baby.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      ageDescription = `${months} months old`;
    }

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    const prompt = `Generate a single encouraging sentence (max 15 words) for a parent dashboard based on this data:

Baby: ${baby.name}
Age: ${ageDescription}
Recent milestones: ${recentMilestones.length} achieved in the last week

Make it warm, supportive, and specific. Examples:
- "${baby.name} hit ${recentMilestones.length} milestones this week—you're doing amazing! 🎉"
- "Great progress this week—${baby.name} is thriving!"
- "Week ${baby.pregnancy_week}: Baby is growing beautifully! 💙"

Return ONLY the sentence, no extra formatting.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || `Welcome back! Let's track ${baby.name}'s journey.`;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ summary: "Welcome! Let's track your baby's journey." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
