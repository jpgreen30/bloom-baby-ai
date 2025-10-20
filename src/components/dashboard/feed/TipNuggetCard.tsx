import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Lightbulb } from "lucide-react";
import { useState } from "react";

interface TipNuggetCardProps {
  tip: {
    id: string;
    title: string;
    content: string;
    category: string;
    icon?: string;
  };
}

const categoryGradients: Record<string, string> = {
  feeding: "bg-gradient-to-br from-secondary/20 to-secondary/5",
  sleep: "bg-gradient-to-br from-accent/20 to-accent/5",
  development: "bg-gradient-to-br from-primary/20 to-primary/5",
  health: "bg-gradient-to-br from-success/20 to-success/5",
  safety: "bg-gradient-to-br from-destructive/20 to-destructive/5",
};

export const TipNuggetCard = ({ tip }: TipNuggetCardProps) => {
  const [saved, setSaved] = useState(false);

  return (
    <Card className={`feed-card w-full border-2 border-accent/30 rounded-none md:rounded-xl p-6 mb-0 md:mb-4 ${
      categoryGradients[tip.category] || "bg-gradient-to-br from-muted/20 to-muted/5"
    }`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-card flex items-center justify-center text-2xl">
          {tip.icon || <Lightbulb className="w-6 h-6 text-primary" />}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{tip.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {tip.category}
                </Badge>
              </div>
              <p className="text-sm text-foreground/80">
                {tip.content}
              </p>
            </div>

            {/* Save Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSaved(!saved)}
              className="flex-shrink-0"
            >
              <Bookmark 
                className={`w-4 h-4 ${saved ? 'fill-current text-primary' : ''}`} 
              />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
