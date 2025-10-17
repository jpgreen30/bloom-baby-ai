import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { babyAge, completedMilestones, upcomingMilestones, babyName } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating predictions for baby:", babyName, "age:", babyAge);

    const systemPrompt = `You are a compassionate pediatric development expert helping parents track their baby's milestones. 
Your role is to:
1. Analyze the baby's current milestone progress
2. Provide encouraging, personalized insights
3. Predict what milestones might come next
4. Offer practical, evidence-based tips
5. Reassure parents while noting if any concerns warrant pediatrician discussion

Be warm, supportive, and clear. Focus on celebrating achievements and providing actionable guidance.`;

    const userPrompt = `Baby ${babyName} is ${babyAge.months} months and ${babyAge.weeks} weeks old.

Recently completed milestones:
${completedMilestones.map((m: any) => `- ${m.title} (${m.category})`).join('\n')}

Upcoming milestones they're approaching:
${upcomingMilestones.map((m: any) => `- ${m.title} (typically ${Math.floor(m.typical_age_weeks / 4)} months, ${m.category})`).join('\n')}

Please provide:
1. A brief celebration of recent progress (2-3 sentences)
2. 2-3 specific milestones to watch for in the coming weeks/months
3. Practical tips to encourage development
4. Any gentle notes about timing variations being normal

Keep the tone joyful, reassuring, and conversational. Format as readable paragraphs.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service requires additional credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const prediction = data.choices[0].message.content;

    console.log("Successfully generated prediction");

    return new Response(
      JSON.stringify({ prediction }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in milestone-predictions function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
