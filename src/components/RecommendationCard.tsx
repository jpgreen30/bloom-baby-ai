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
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
            <CardDescription className="mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-primary">${listing.price}</span>
                <Badge variant="outline">{listing.category}</Badge>
                <Badge variant="secondary">{listing.condition}</Badge>
              </div>
            </CardDescription>
          </div>
          <Badge variant={config.color} className="flex items-center gap-1 whitespace-nowrap">
            <UrgencyIcon className="h-3 w-3" />
            {config.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">{relevance_score}% Match</span>
          </div>
          <p className="text-sm text-muted-foreground">{reason}</p>
          <Button onClick={handleViewProduct} className="w-full">
            View Product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;