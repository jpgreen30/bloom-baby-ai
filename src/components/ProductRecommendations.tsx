import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import RecommendationCard from "@/components/RecommendationCard";
import AffiliateProductCard from "@/components/AffiliateProductCard";
import { Sparkles, RefreshCw } from "lucide-react";

interface ProductRecommendationsProps {
  babyId: string;
  babyName: string;
  babyAge?: number;
  isPregnancy?: boolean;
  pregnancyWeek?: number;
  completedMilestones?: string[];
  upcomingMilestones?: string[];
}

const ProductRecommendations = ({
  babyId,
  babyName,
  babyAge,
  isPregnancy,
  pregnancyWeek,
  completedMilestones = [],
  upcomingMilestones = [],
}: ProductRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchExistingRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch both marketplace and affiliate recommendations
      const [marketplaceRes, affiliateRes] = await Promise.all([
        supabase
          .from('product_recommendations')
          .select('*, listing:marketplace_listings(*)')
          .eq('user_id', user.id)
          .order('relevance_score', { ascending: false })
          .limit(8),
        supabase
          .from('awin_recommendations')
          .select('*, product:awin_products(*)')
          .eq('user_id', user.id)
          .order('relevance_score', { ascending: false })
          .limit(8),
      ]);

      if (marketplaceRes.error && affiliateRes.error) {
        throw new Error('Failed to fetch recommendations');
      }

      // Combine and sort by relevance score
      const combined = [
        ...(marketplaceRes.data || []).map(r => ({ ...r, source: 'marketplace' })),
        ...(affiliateRes.data || []).map(r => ({ ...r, source: 'affiliate' })),
      ].sort((a, b) => b.relevance_score - a.relevance_score);

      if (combined.length > 0) {
        setRecommendations(combined);
        const latestTimestamp = Math.max(
          ...(marketplaceRes.data || []).map(r => new Date(r.recommended_at).getTime()),
          ...(affiliateRes.data || []).map(r => new Date(r.recommended_at).getTime())
        );
        setLastUpdated(new Date(latestTimestamp));
      } else {
        // No existing recommendations, generate new ones
        generateRecommendations(false);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      generateRecommendations(false);
    }
  };

  const generateRecommendations = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('recommend-products', {
        body: {
          babyAge,
          isPregnancy,
          pregnancyWeek,
          completedMilestones,
          upcomingMilestones,
          forceRefresh,
        },
      });

      if (error) throw error;

      setRecommendations(data.recommendations || []);
      setLastUpdated(new Date());
      
      if (!data.cached) {
        const total = data.recommendations?.length || 0;
        const marketplace = data.marketplaceCount || 0;
        const affiliate = data.affiliateCount || 0;
        toast({
          title: "Recommendations Updated",
          description: `Found ${total} products: ${marketplace} marketplace, ${affiliate} affiliate deals for ${babyName}.`,
        });
      }
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
    fetchExistingRecommendations();
  }, []);

  if (recommendations.length === 0 && !loading) {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="w-20 h-20 bg-gradient-to-br from-primary via-secondary to-accent rounded-full mx-auto flex items-center justify-center shadow-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
            Discover Your Perfect Picks
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get AI-powered product recommendations curated for {babyName}'s current stage
          </p>
        </div>
        <Button onClick={() => generateRecommendations(false)} size="lg" className="h-14 px-8 text-lg gap-3 shadow-xl hover:shadow-2xl">
          <Sparkles className="w-6 h-6" />
          Generate My Recommendations
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Curated Just for {babyName}
            </h2>
          </div>
          <p className="text-muted-foreground text-lg">
            {isPregnancy && pregnancyWeek ? `Perfect for pregnancy week ${pregnancyWeek}` : babyAge ? `Ideal for ${babyAge} weeks old` : 'Personalized recommendations'}
            {lastUpdated && ` • Last updated ${Math.round((new Date().getTime() - lastUpdated.getTime()) / (1000 * 60 * 60))}h ago`}
          </p>
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {recommendations.filter(r => r.source === 'marketplace').length} Marketplace Deals
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {recommendations.filter(r => r.source === 'affiliate').length} Partner Products
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => generateRecommendations(true)}
          disabled={loading}
          size="lg"
          variant="outline"
          className="gap-2 border-2 border-primary/30 hover:border-primary hover:bg-primary/5 h-12 px-6"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Picks
        </Button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-72 bg-muted animate-pulse rounded-2xl" />
              <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((rec) => 
              rec.source === 'marketplace' ? (
                <RecommendationCard
                  key={`mp-${rec.listing_id}`}
                  listing={rec.listing}
                  relevance_score={rec.relevance_score}
                  reason={rec.reason}
                  urgency={rec.urgency}
                  onTrackClick={() => trackClick(rec.listing_id, rec.id)}
                />
              ) : (
                <AffiliateProductCard
                  key={`af-${rec.awin_product_id}`}
                  product={rec.product}
                  relevance_score={rec.relevance_score}
                  reason={rec.reason}
                  urgency={rec.urgency}
                  recommendationId={rec.id}
                  onTrackClick={() => {}}
                />
              )
            )}
          </div>
        )
      }
      
      {/* Affiliate Disclosure */}
      <div className="mt-8 p-5 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl text-center border border-primary/10">
        <p className="text-sm text-muted-foreground">
          💝 We may earn a small commission from purchases made through our affiliate links at no extra cost to you. 
          This helps us provide free personalized recommendations and keep the platform running.
        </p>
      </div>
    </div>
  );
};

export default ProductRecommendations;