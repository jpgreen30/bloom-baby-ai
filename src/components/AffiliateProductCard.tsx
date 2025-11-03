import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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

  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    onTrackClick();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: baby } = await supabase
        .from('babies')
        .select('id')
        .eq('user_id', user.id)
        .single();

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
        window.open(product.product_url, '_blank');
        return;
      }

      window.open(data.deepLink, '_blank');
    } catch (err) {
      console.error('Error handling affiliate click:', err);
      window.open(product.product_url, '_blank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all group border-2 border-transparent hover:border-secondary/30">
      <div className="relative h-56 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
        {product.image_url && (
          <img
            src={product.image_url}
            alt={product.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        )}
        {urgency && (
          <Badge className={`absolute top-3 right-3 ${urgencyColor} shadow-lg text-xs font-bold px-3 py-1`}>
            {urgency}
          </Badge>
        )}
        <Badge className="absolute top-3 left-3 bg-secondary text-white shadow-lg font-semibold flex items-center gap-1">
          <Store className="h-3 w-3" />
          {product.merchant_name}
        </Badge>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center gap-2 flex-wrap">
            {product.category && (
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white/90 text-xs font-medium">
                {product.category}
              </span>
            )}
            {product.stock_status && (
              <span className={`backdrop-blur-sm px-2 py-1 rounded text-xs font-medium ${
                product.stock_status === 'in_stock' 
                  ? 'bg-success/80 text-white' 
                  : 'bg-destructive/80 text-white'
              }`}>
                {product.stock_status === 'in_stock' ? '✓ In Stock' : '⚠ Low Stock'}
              </span>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-secondary transition-colors">
            {product.product_name}
          </h3>
          {product.brand && (
            <p className="text-sm text-muted-foreground font-medium mt-1">{product.brand}</p>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-secondary">
            ${product.price.toFixed(2)}
          </span>
        </div>

        <div className="space-y-2 p-3 bg-gradient-to-br from-secondary/5 to-accent/5 rounded-lg border border-secondary/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Match Score</span>
            <div className="flex items-center gap-1">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-secondary to-accent rounded-full" 
                  style={{ width: `${relevance_score}%` }}
                />
              </div>
              <span className="font-bold text-secondary">{relevance_score}%</span>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-snug">{reason}</p>
        </div>

        <Button 
          className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all bg-secondary hover:bg-secondary/90"
          onClick={handleClick}
          disabled={loading || product.stock_status === 'out_of_stock'}
          size="lg"
        >
          {loading ? (
            "Opening..."
          ) : (
            <>
              <ExternalLink className="w-5 h-5 mr-2" />
              Shop Now →
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center leading-tight">
          🤝 Affiliate partner • Small commission supports our free service
        </p>
      </CardContent>
    </Card>
  );
};

export default AffiliateProductCard;