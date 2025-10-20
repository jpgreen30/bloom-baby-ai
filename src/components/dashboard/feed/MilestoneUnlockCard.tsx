import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertCircle, Trophy } from "lucide-react";
import { useState, useEffect } from "react";

interface MilestoneUnlockCardProps {
  data: {
    id: string;
    status: string;
    achieved_at?: string;
    milestone: {
      title: string;
      description: string;
      category: string;
      typical_age_weeks: number;
    };
  };
  onStatusChange?: (milestoneId: string, status: string) => void;
}

const categoryColors: Record<string, string> = {
  motor: "bg-primary/10 text-primary",
  cognitive: "bg-accent/10 text-accent",
  social: "bg-secondary/10 text-secondary",
  language: "bg-success/10 text-success",
};

export const MilestoneUnlockCard = ({ data, onStatusChange }: MilestoneUnlockCardProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const isNewlyAchieved = data.achieved_at && 
    (Date.now() - new Date(data.achieved_at).getTime()) < 24 * 60 * 60 * 1000;

  useEffect(() => {
    if (isNewlyAchieved) {
      const hasShown = localStorage.getItem(`confetti-${data.id}`);
      if (!hasShown) {
        setShowConfetti(true);
        localStorage.setItem(`confetti-${data.id}`, 'true');
        
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [isNewlyAchieved, data.id]);

  return (
    <Card className="feed-card w-full border-2 border-accent/30 rounded-none md:rounded-xl p-6 mb-0 md:mb-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-particle"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            {data.status === 'achieved' ? (
              <Trophy className="w-6 h-6 text-primary" />
            ) : data.status === 'in_progress' ? (
              <Clock className="w-6 h-6 text-accent" />
            ) : (
              <AlertCircle className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-lg text-foreground">
                {data.milestone.title}
              </h3>
              <Badge className={categoryColors[data.milestone.category] || "bg-muted"}>
                {data.milestone.category}
              </Badge>
              {isNewlyAchieved && (
                <Badge className="bg-success text-success-foreground">NEW! 🎉</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {data.milestone.description}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={data.status === 'achieved' ? 'default' : 'outline'}
              onClick={() => onStatusChange?.(data.id, 'achieved')}
              className="gap-1"
            >
              <Check className="w-4 h-4" />
              Complete
            </Button>
            <Button
              size="sm"
              variant={data.status === 'in_progress' ? 'default' : 'outline'}
              onClick={() => onStatusChange?.(data.id, 'in_progress')}
              className="gap-1"
            >
              <Clock className="w-4 h-4" />
              In Progress
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
