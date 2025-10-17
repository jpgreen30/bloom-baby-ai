import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";

interface MilestoneCardProps {
  milestone: {
    id: string;
    title: string;
    description: string;
    category: string;
    typical_age_weeks: number;
    tips: string;
  };
  status?: string;
  onStatusChange: (status: string) => void;
}

const categoryColors = {
  motor: "bg-primary/10 text-primary border-primary/20",
  cognitive: "bg-accent/10 text-accent border-accent/20",
  social: "bg-secondary/10 text-secondary border-secondary/20",
  language: "bg-success/10 text-success border-success/20",
};

const statusIcons = {
  achieved: <CheckCircle2 className="w-5 h-5 text-success" />,
  in_progress: <Clock className="w-5 h-5 text-accent" />,
  delayed: <AlertCircle className="w-5 h-5 text-destructive" />,
  not_started: <Circle className="w-5 h-5 text-muted-foreground" />,
};

export const MilestoneCard = ({ milestone, status = "not_started", onStatusChange }: MilestoneCardProps) => {
  const categoryColor = categoryColors[milestone.category as keyof typeof categoryColors];
  const ageInMonths = Math.floor(milestone.typical_age_weeks / 4);

  return (
    <Card className="hover:shadow-soft transition-all duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {statusIcons[status as keyof typeof statusIcons]}
              <CardTitle className="text-lg">{milestone.title}</CardTitle>
            </div>
            <CardDescription>{milestone.description}</CardDescription>
          </div>
          <Badge variant="outline" className={categoryColor}>
            {milestone.category}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Typical age: {ageInMonths} months
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {milestone.tips && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground"><strong>Tip:</strong> {milestone.tips}</p>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={status === "achieved" ? "default" : "outline"}
            onClick={() => onStatusChange("achieved")}
            className="flex-1"
          >
            Achieved
          </Button>
          <Button
            size="sm"
            variant={status === "in_progress" ? "default" : "outline"}
            onClick={() => onStatusChange("in_progress")}
            className="flex-1"
          >
            In Progress
          </Button>
          <Button
            size="sm"
            variant={status === "delayed" ? "destructive" : "outline"}
            onClick={() => onStatusChange("delayed")}
            className="flex-1"
          >
            Delayed
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
