import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface AffiliateProductCardProps {
  product: {
    id: string;
    awin_product_id: string;
    product_name: string;
    merchant_name: string;
    merchant_id: string;
    price: number;
    currency: string;
    image_url?: string;
    category?: string;
    brand?: string;
    stock_status: string;
    product_url: string;
  };
  relevance_score: number;
  reason: string;
  urgency?: string;
  recommendationId?: string;
  onTrackClick: () => void;
}

const AffiliateProductCard = ({
  product,
  relevance_score,
  reason,
  urgency,
  recommendationId,
  onTrackClick,
}: AffiliateProductCardProps) => {
  const urgencyColor = {
    high: 'bg-destructive',
    medium: 'bg-warning',
    low: 'bg-muted',
  }[urgency || 'medium'];

  const handleClick = async () => {
    onTrackClick();

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get baby data
      const { data: baby } = await supabase
        .from('babies')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Generate deep link via edge function
      const { data, error } = await supabase.functions.invoke('generate-awin-deeplink', {
        body: {
          productUrl: product.product_url,
          merchantId: product.merchant_id,
          recommendationId: recommendationId,
          userId: user.id,
          babyId: baby?.id,
        },
      });

      if (error) {
        console.error('Error generating deep link:', error);
        // Fallback: open original product URL
        window.open(product.product_url, '_blank');
        return;
      }

      // Open the affiliate deep link
      window.open(data.deepLink, '_blank');
    } catch (err) {
      console.error('Error handling affiliate click:', err);
      window.open(product.product_url, '_blank');
    }
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Store className="h-3 w-3" />
            {product.merchant_name}
          </Badge>
          {urgency && (
            <Badge variant="outline" className={`${urgencyColor} text-xs`}>
              {urgency}
            </Badge>
          )}
        </div>
        {product.image_url && (
          <div className="w-full aspect-square relative mb-3 rounded-md overflow-hidden bg-muted">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="object-cover w-full h-full"
              loading="lazy"
            />
          </div>
        )}
        <CardTitle className="text-lg line-clamp-2">{product.product_name}</CardTitle>
        {product.brand && (
          <CardDescription className="text-sm">
            Brand: {product.brand}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </span>
            <Badge variant="outline" className="text-xs">
              {relevance_score}% match
            </Badge>
          </div>
          
          {product.category && (
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
          )}
          
          <p className="text-sm text-muted-foreground">{reason}</p>
          
          {product.stock_status === 'out_of_stock' && (
            <Badge variant="destructive" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button 
          onClick={handleClick}
          className="w-full"
          disabled={product.stock_status === 'out_of_stock'}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Shop at {product.merchant_name}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Affiliate link • We may earn a commission
        </p>
      </CardFooter>
    </Card>
  );
};

export default AffiliateProductCard;