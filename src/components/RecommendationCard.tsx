import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, TrendingUp, Clock } from "lucide-react";

interface RecommendationCardProps {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    condition: string;
    age_range?: string;
  };
  relevance_score: number;
  reason: string;
  urgency?: string;
  onTrackClick: () => void;
}

const RecommendationCard = ({ 
  listing, 
  relevance_score, 
  reason, 
  urgency,
  onTrackClick 
}: RecommendationCardProps) => {
  const navigate = useNavigate();

  // Safety check: if listing is undefined, don't render
  if (!listing) {
    console.warn('RecommendationCard received undefined listing');
    return null;
  }

  const urgencyConfig = {
    high: { label: 'Needed Now', color: 'destructive' as const, icon: Clock },
    medium: { label: 'Needed Soon', color: 'default' as const, icon: TrendingUp },
    low: { label: 'Nice to Have', color: 'secondary' as const, icon: Sparkles },
  };

  const config = urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.medium;
  const UrgencyIcon = config.icon;

  const handleViewProduct = () => {
    onTrackClick();
    navigate('/marketplace');
  };

  return (
    <Card className="overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all cursor-pointer group border-2 border-transparent hover:border-primary/30" onClick={handleViewProduct}>
      <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50">
        {urgency && (
          <Badge className={`absolute top-3 right-3 shadow-lg text-xs font-bold px-3 py-1 flex items-center gap-1 z-10`} variant={config.color}>
            <UrgencyIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">{listing.category}</span>
            <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded">{listing.condition}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</h3>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">${listing.price}</span>
        </div>

        <div className="space-y-2 p-3 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border border-primary/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">Match Score</span>
            <div className="flex items-center gap-1">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full" 
                  style={{ width: `${relevance_score}%` }}
                />
              </div>
              <span className="font-bold text-primary">{relevance_score}%</span>
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-snug">{reason}</p>
        </div>

        <Button className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" size="lg">
          View Details →
        </Button>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;