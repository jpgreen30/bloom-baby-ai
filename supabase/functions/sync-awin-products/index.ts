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
    const awinOAuthToken = Deno.env.get('AWIN_OAUTH_TOKEN');
    const awinPublisherId = Deno.env.get('AWIN_PUBLISHER_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!awinOAuthToken || !awinPublisherId) {
      throw new Error('Awin credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching products from Awin API...');

    // Fetch products from Awin Product Feed API
    const awinResponse = await fetch(
      `https://api.awin.com/publishers/${awinPublisherId}/productfeeds/`, 
      {
        headers: {
          'Authorization': `Bearer ${awinOAuthToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!awinResponse.ok) {
      const errorText = await awinResponse.text();
      console.error('Awin API error:', awinResponse.status, errorText);
      throw new Error(`Awin API error: ${awinResponse.status}`);
    }

    const awinData = await awinResponse.json();
    console.log('Received Awin data:', JSON.stringify(awinData).substring(0, 200));

    // Category mapping for baby products
    const babyCategoryKeywords = [
      'baby', 'infant', 'newborn', 'toddler', 'nursery', 'maternity', 
      'pregnancy', 'stroller', 'crib', 'diaper', 'formula', 'toys'
    ];

    // Age range mapping helper
    const determineAgeRange = (productName: string, description: string): string => {
      const combined = `${productName} ${description}`.toLowerCase();
      
      if (combined.match(/newborn|0-3|0-6/i)) return '0-3months';
      if (combined.match(/3-6|6-9/i)) return '3-6months';
      if (combined.match(/6-12|9-12/i)) return '6-12months';
      if (combined.match(/12-18|1-2/i)) return '12-18months';
      if (combined.match(/toddler|18-24|2-3/i)) return '18-24months';
      if (combined.match(/pregnancy|prenatal|maternity/i)) return 'pregnancy';
      
      return 'all-ages';
    };

    // Process and insert products
    let productsInserted = 0;
    let productsUpdated = 0;

    // Note: Awin API structure varies by feed. This is a generic structure.
    // You may need to adjust based on actual Awin response format
    const products = Array.isArray(awinData) ? awinData : awinData.products || [];

    for (const product of products) {
      try {
        // Filter for baby-related products
        const productText = `${product.product_name || ''} ${product.description || ''} ${product.category_name || ''}`.toLowerCase();
        const isBabyProduct = babyCategoryKeywords.some(keyword => productText.includes(keyword));

        if (!isBabyProduct) continue;

        const productData = {
          awin_product_id: String(product.aw_product_id || product.product_id || product.id),
          merchant_id: String(product.merchant_id || product.advertiser_id || 'unknown'),
          merchant_name: product.merchant_name || product.advertiser_name || 'Unknown Merchant',
          product_name: product.product_name || product.name || 'Unnamed Product',
          description: product.description || product.product_short_description || null,
          price: parseFloat(product.search_price || product.price || '0'),
          currency: product.currency || 'USD',
          category: product.category_name || product.merchant_category || null,
          subcategory: product.subcategory || null,
          age_range: determineAgeRange(
            product.product_name || '', 
            product.description || ''
          ),
          product_url: product.aw_deep_link || product.merchant_deep_link || product.product_url,
          image_url: product.aw_image_url || product.merchant_image_url || product.large_image || null,
          brand: product.brand_name || product.merchant_name || null,
          stock_status: product.in_stock === false ? 'out_of_stock' : 'in_stock',
          last_synced: new Date().toISOString(),
        };

        // Upsert product (insert or update if exists)
        const { error } = await supabase
          .from('awin_products')
          .upsert(productData, {
            onConflict: 'awin_product_id',
            ignoreDuplicates: false,
          });

        if (error) {
          console.error('Error upserting product:', error);
        } else {
          productsInserted++;
        }
      } catch (err) {
        console.error('Error processing product:', err);
      }
    }

    console.log(`Sync complete: ${productsInserted} products upserted`);

    return new Response(
      JSON.stringify({
        success: true,
        productsProcessed: products.length,
        productsInserted,
        productsUpdated,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error syncing Awin products:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});