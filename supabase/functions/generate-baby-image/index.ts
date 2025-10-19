import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { isPregnancy, pregnancyWeek, ageMonths, babyName, babyId, forceRegenerate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client for caching
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate appropriate prompt based on pregnancy or baby age
    let prompt = '';
    let cacheKey = '';

    if (isPregnancy && pregnancyWeek) {
      cacheKey = `pregnancy_week_${pregnancyWeek}`;
      if (pregnancyWeek <= 12) {
        prompt = `Medical illustration of early fetal development at week ${pregnancyWeek} of pregnancy, showing tiny embryo with visible head and body, size comparison to a small fruit, transparent educational background, soft pastel colors, gentle lighting, ultra high resolution`;
      } else if (pregnancyWeek <= 28) {
        prompt = `Detailed medical illustration of fetus at week ${pregnancyWeek} of pregnancy, showing developed features including face, limbs, and body proportions, peaceful floating pose in warm amniotic environment, soft blue and pink tones, educational medical art style, ultra high resolution`;
      } else {
        prompt = `Realistic medical illustration of fully formed baby at week ${pregnancyWeek} of pregnancy, showing well-developed features, gentle curled position, warm soft lighting, peaceful expression, medical educational art style with warm tones, ultra high resolution`;
      }
    } else if (ageMonths !== undefined) {
      cacheKey = `baby_month_${ageMonths}`;
      if (ageMonths <= 3) {
        prompt = `Adorable peaceful newborn baby at ${ageMonths} months old, sleeping peacefully, soft pastel nursery background, gentle natural lighting, ultra high resolution, professional baby photography style`;
      } else if (ageMonths <= 8) {
        prompt = `Happy ${ageMonths}-month-old baby, sitting and playing with colorful toys, bright cheerful nursery setting, joyful expression, soft natural lighting, ultra high resolution, professional baby photography`;
      } else if (ageMonths <= 18) {
        prompt = `Active curious ${ageMonths}-month-old toddler, exploring and playing, bright playful environment, energetic happy expression, natural daylight, ultra high resolution, professional child photography`;
      } else {
        prompt = `Playful ${ageMonths}-month-old toddler, engaged in creative play activity, vibrant colorful setting, excited curious expression, natural lighting, ultra high resolution, professional child photography`;
      }
    }

    // Check cache first (unless forceRegenerate is true)
    if (babyId && !forceRegenerate) {
      const { data: cached } = await supabase
        .from('generated_images')
        .select('image_data, prompt')
        .eq('baby_id', babyId)
        .eq('cache_key', cacheKey)
        .maybeSingle();

      if (cached) {
        console.log('Cache hit for:', cacheKey);
        return new Response(
          JSON.stringify({ 
            imageUrl: cached.image_data,
            cacheKey,
            prompt: cached.prompt,
            cached: true
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    console.log('Cache miss, generating image with prompt:', prompt);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    // Save to cache if babyId is provided
    if (babyId) {
      await supabase
        .from('generated_images')
        .upsert({
          baby_id: babyId,
          cache_key: cacheKey,
          image_data: imageUrl,
          prompt
        }, {
          onConflict: 'baby_id,cache_key'
        });
      console.log('Image cached for future use');
    }

    return new Response(
      JSON.stringify({ 
        imageUrl,
        cacheKey,
        prompt,
        cached: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in generate-baby-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});