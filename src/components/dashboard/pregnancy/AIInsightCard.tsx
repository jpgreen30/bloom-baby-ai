import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIInsightCardProps {
  babyName?: string;
  aiSummary: string;
  currentWeek: number;
}

export const AIInsightCard = ({ babyName, aiSummary, currentWeek }: AIInsightCardProps) => {
  const defaultMessage = `Week ${currentWeek}: Your baby is developing beautifully. Stay hydrated and rest when you need to.`;

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-foreground mb-2">
            AI Insight for Week {currentWeek}
          </h3>
          <p className="text-foreground/90 leading-relaxed">
            {aiSummary || defaultMessage}
          </p>
        </div>
      </div>
    </Card>
  );
};
