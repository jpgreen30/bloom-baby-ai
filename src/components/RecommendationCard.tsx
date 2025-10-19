import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecommendationCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    condition: string;
  };
  relevanceScore: number;
  reason: string;
  imageUrl?: string;
  recommendationId: string;
}

export const RecommendationCard = ({
  listing,
  relevanceScore,
  reason,
  imageUrl,
  recommendationId,
}: RecommendationCardProps) => {
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      // Mark as clicked
      await supabase
        .from('product_recommendations')
        .update({ clicked: true })
        .eq('id', recommendationId);

      // Track click
      const { data: currentListing } = await supabase
        .from('marketplace_listings')
        .select('click_count')
        .eq('id', listing.id)
        .single();

      if (currentListing) {
        await supabase
          .from('marketplace_listings')
          .update({ click_count: (currentListing.click_count || 0) + 1 })
          .eq('id', listing.id);
      }

      navigate('/marketplace');
    } catch (error) {
      console.error('Error tracking click:', error);
      toast.error('Failed to track interaction');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="aspect-video bg-muted relative">
        {imageUrl ? (
          <img src={imageUrl} alt={listing.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        <Badge className="absolute top-2 right-2 bg-primary/90">
          <Sparkles className="w-3 h-3 mr-1" />
          {relevanceScore}% match
        </Badge>
      </div>
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold line-clamp-1">{listing.title}</h3>
          <span className="font-bold text-primary">${listing.price}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{reason}</p>
        <div className="flex gap-2">
          <Badge variant="secondary">{listing.category}</Badge>
          <Badge variant="outline">{listing.condition}</Badge>
        </div>
        <Button className="w-full" size="sm">View Product</Button>
      </CardContent>
    </Card>
  );
};
