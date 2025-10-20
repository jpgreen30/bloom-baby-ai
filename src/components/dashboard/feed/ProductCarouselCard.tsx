import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  relevance_score: number;
  reason: string;
  urgency?: string;
  listing: {
    id: string;
    title: string;
    price: number;
    original_price?: number;
    condition: string;
    marketplace_images: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  };
}

interface ProductCarouselCardProps {
  products: Product[];
}

export const ProductCarouselCard = ({ products }: ProductCarouselCardProps) => {
  const [emblaRef] = useEmblaCarousel({ 
    loop: false, 
    align: 'start',
    slidesToScroll: 1 
  });

  const handleProductClick = async (productId: string, listingId: string) => {
    await supabase
      .from('product_recommendations')
      .update({ clicked: true })
      .eq('id', productId);
    
    window.open(`/marketplace?listing=${listingId}`, '_blank');
  };

  if (products.length === 0) return null;

  const mainProduct = products[0];

  return (
    <Card className="feed-card w-full border-2 border-accent/30 rounded-none md:rounded-xl p-0 mb-0 md:mb-4 overflow-hidden">
      <div className="p-4 bg-gradient-card border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Recommended for You</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {mainProduct.reason}
        </p>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {products.map((product) => {
            const primaryImage = product.listing.marketplace_images?.find(img => img.is_primary)?.image_url 
              || product.listing.marketplace_images?.[0]?.image_url;
            
            return (
              <div 
                key={product.id} 
                className="flex-[0_0_85%] md:flex-[0_0_45%] min-w-0 px-2 first:pl-4 last:pr-4"
              >
                <div className="bg-card rounded-lg overflow-hidden border">
                  {/* Product Image */}
                  {primaryImage && (
                    <div className="relative aspect-square bg-muted">
                      <img 
                        src={primaryImage} 
                        alt={product.listing.title}
                        className="w-full h-full object-cover"
                      />
                      {product.urgency === 'high' && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground">
                          Limited Stock
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="p-3 space-y-2">
                    <h4 className="font-medium text-sm line-clamp-2 text-foreground">
                      {product.listing.title}
                    </h4>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">
                        ${product.listing.price}
                      </span>
                      {product.listing.original_price && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.listing.original_price}
                        </span>
                      )}
                    </div>

                    <Badge variant="secondary" className="text-xs">
                      {product.listing.condition}
                    </Badge>

                    <Button 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => handleProductClick(product.id, product.listing.id)}
                    >
                      View Item
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
