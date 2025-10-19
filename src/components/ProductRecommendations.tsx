import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RecommendationCard from "@/components/RecommendationCard";
import { Sparkles, RefreshCw } from "lucide-react";

interface ProductRecommendationsProps {
  babyName: string;
  babyAge: string;
  isPregnancy?: boolean;
  pregnancyWeek?: number;
  completedMilestones: string[];
  upcomingMilestones: string[];
}

const ProductRecommendations = ({
  babyName,
  babyAge,
  isPregnancy,
  pregnancyWeek,
  completedMilestones,
  upcomingMilestones,
}: ProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-products', {
        body: {
          babyAge,
          isPregnancy,
          pregnancyWeek,
          completedMilestones,
          upcomingMilestones,
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      toast({
        title: "Recommendations Updated",
        description: `Found ${data.recommendations?.length || 0} personalized products for ${babyName}.`,
      });
    } catch (error: any) {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackClick = async (listingId: string, recommendationId?: string) => {
    try {
      // Update click tracking
      if (recommendationId) {
        await supabase
          .from('product_recommendations')
          .update({ clicked: true })
          .eq('id', recommendationId);
      }

      // Increment listing click count
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('click_count')
        .eq('id', listingId)
        .single();

      if (listing) {
        await supabase
          .from('marketplace_listings')
          .update({ click_count: (listing.click_count || 0) + 1 })
          .eq('id', listingId);
      }
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  useEffect(() => {
    generateRecommendations();
  }, []);

  if (recommendations.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Smart Product Recommendations
              </CardTitle>
              <CardDescription>
                Personalized marketplace picks based on {babyName}'s journey
              </CardDescription>
            </div>
            <Button onClick={generateRecommendations} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Click "Generate" to get AI-powered product recommendations
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Recommended for {babyName}
            </CardTitle>
            <CardDescription>
              {recommendations.length} personalized picks from the marketplace
            </CardDescription>
          </div>
          <Button onClick={generateRecommendations} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <RecommendationCard
                key={rec.listing_id}
                listing={rec.listing}
                relevance_score={rec.relevance_score}
                reason={rec.reason}
                urgency={rec.urgency}
                onTrackClick={() => trackClick(rec.listing_id, rec.id)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;