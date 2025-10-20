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
    const { productUrl, merchantId, recommendationId, userId, babyId } = await req.json();

    if (!productUrl) {
      throw new Error('Product URL is required');
    }

    const awinOAuthToken = Deno.env.get('AWIN_OAUTH_TOKEN');
    const awinPublisherId = Deno.env.get('AWIN_PUBLISHER_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!awinOAuthToken || !awinPublisherId) {
      throw new Error('Awin credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate custom tracking code
    const customTracking = `user_${userId}_baby_${babyId}_rec_${recommendationId}`;

    console.log('Generating deep link for:', productUrl);

    // Call Awin Deep Link API
    const deepLinkResponse = await fetch(
      `https://api.awin.com/publishers/${awinPublisherId}/deeplinks`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${awinOAuthToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          url: productUrl,
          advertiserId: merchantId,
          customTrackingCode: customTracking,
        }),
      }
    );

    if (!deepLinkResponse.ok) {
      const errorText = await deepLinkResponse.text();
      console.error('Awin deep link error:', deepLinkResponse.status, errorText);
      
      // Fallback: use basic affiliate link format
      const fallbackUrl = `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${awinPublisherId}&clickref=${customTracking}&ued=${encodeURIComponent(productUrl)}`;
      
      console.log('Using fallback deep link format');
      return new Response(
        JSON.stringify({ deepLink: fallbackUrl, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const deepLinkData = await deepLinkResponse.json();
    const deepLink = deepLinkData.shortUrl || deepLinkData.longUrl || deepLinkData.url;

    // Update recommendation click tracking
    if (recommendationId && userId) {
      await supabase
        .from('awin_recommendations')
        .update({
          clicked: true,
          clicked_at: new Date().toISOString(),
        })
        .eq('id', recommendationId)
        .eq('user_id', userId);

      // Update profile click count
      const { data: profile } = await supabase
        .from('profiles')
        .select('awin_click_count')
        .eq('id', userId)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ 
            awin_click_count: (profile.awin_click_count || 0) + 1 
          })
          .eq('id', userId);
      }
    }

    console.log('Deep link generated successfully');

    return new Response(
      JSON.stringify({ deepLink, fallback: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error generating deep link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});