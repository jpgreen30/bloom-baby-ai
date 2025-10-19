import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecommendationCard } from "./RecommendationCard";

interface SmartRecommendationsProps {
  babyId: string;
}

export const SmartRecommendations = ({ babyId }: SmartRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('product_recommendations')
        .select(`
          id,
          relevance_score,
          reason,
          listing_id,
          marketplace_listings (
            id,
            title,
            price,
            category,
            condition,
            marketplace_images (
              image_url,
              is_primary
            )
          )
        `)
        .order('relevance_score', { ascending: false })
        .limit(5);

      if (error) throw error;

      setRecommendations(data || []);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('recommend-products', {
        body: { babyId }
      });

      if (error) throw error;

      toast.success('Smart recommendations updated!');
      await loadRecommendations();
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast.error(error.message || 'Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  if (recommendations.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Smart Product Recommendations
          </CardTitle>
          <CardDescription>
            Get AI-powered product suggestions based on your baby's development stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateRecommendations} disabled={loading}>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Recommendations
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommended For You
            </CardTitle>
            <CardDescription>
              Personalized picks based on your baby's current stage
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((rec) => {
            const listing = rec.marketplace_listings;
            const primaryImage = listing?.marketplace_images?.find((img: any) => img.is_primary);
            
            return (
              <RecommendationCard
                key={rec.id}
                listing={{
                  id: listing.id,
                  title: listing.title,
                  price: listing.price,
                  category: listing.category,
                  condition: listing.condition,
                }}
                relevanceScore={rec.relevance_score}
                reason={rec.reason}
                imageUrl={primaryImage?.image_url}
                recommendationId={rec.id}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
