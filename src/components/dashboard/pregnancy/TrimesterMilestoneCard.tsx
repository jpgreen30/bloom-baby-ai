import { Baby, CheckCircle, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Milestone {
  week: number;
  title: string;
  description: string;
}

interface TrimesterMilestoneCardProps {
  trimester: number;
  currentWeek: number;
}

const milestones: Record<number, Milestone[]> = {
  1: [
    { week: 4, title: "Embryo Implantation", description: "Baby is about the size of a poppy seed and implanting in your uterus" },
    { week: 6, title: "Heartbeat Begins", description: "Baby's heart starts to beat around 110 times per minute" },
    { week: 8, title: "Major Organs Forming", description: "All major organs begin developing, including brain and spine" },
    { week: 10, title: "Baby Officially a Fetus", description: "Critical development period complete, now entering growth phase" },
    { week: 12, title: "First Trimester Complete", description: "Risk of miscarriage decreases significantly, you may feel relief from nausea" }
  ],
  2: [
    { week: 14, title: "Facial Features Developing", description: "Baby can squint, frown, and make facial expressions" },
    { week: 16, title: "Gender May Be Visible", description: "Ultrasound may reveal baby's gender if they cooperate!" },
    { week: 18, title: "Baby Can Hear", description: "Your baby can now hear your voice and may respond to sounds" },
    { week: 20, title: "Halfway There!", description: "You may feel flutters and kicks as baby becomes more active" },
    { week: 24, title: "Viability Milestone", description: "Baby has a chance of survival with medical care if born early" },
    { week: 27, title: "Second Trimester Complete", description: "Baby's brain is rapidly developing, they're dreaming!" }
  ],
  3: [
    { week: 28, title: "Eyes Can Open", description: "Baby can now open their eyes and see light filtering through" },
    { week: 32, title: "Lungs Maturing", description: "Baby practices breathing movements, lungs producing surfactant" },
    { week: 34, title: "Baby Storing Fat", description: "Gaining about half a pound per week, getting ready for birth" },
    { week: 36, title: "Full Term Approaching", description: "Baby is likely in head-down position, preparing for delivery" },
    { week: 37, title: "Early Term", description: "Baby is considered early term and could arrive safely any day" },
    { week: 39, title: "Full Term", description: "Baby is fully developed and ready to meet you!" },
    { week: 40, title: "Due Date!", description: "Your baby is ready to be born. Labor could start any moment!" }
  ]
};

export const TrimesterMilestoneCard = ({ trimester, currentWeek }: TrimesterMilestoneCardProps) => {
  const trimesterMilestones = milestones[trimester] || [];
  const visibleMilestones = trimesterMilestones.filter(
    m => m.week >= currentWeek - 2 && m.week <= currentWeek + 6
  );

  if (visibleMilestones.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Baby className="w-6 h-6 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Pregnancy Milestones</h3>
      </div>

      <div className="space-y-4">
        {visibleMilestones.map(milestone => {
          const isComplete = milestone.week <= currentWeek;
          const isCurrent = milestone.week === currentWeek;
          
          return (
            <div
              key={milestone.week}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all ${
                isComplete 
                  ? 'bg-success/10 border-success/40' 
                  : isCurrent
                  ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/20'
                  : 'bg-muted border-border'
              }`}
            >
              <div className="flex-shrink-0 mt-1">
                {isComplete ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : (
                  <Circle className={`w-6 h-6 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${isComplete ? 'text-success' : isCurrent ? 'text-primary' : 'text-foreground'}`}>
                    {milestone.title}
                  </span>
                  <span className="text-sm text-muted-foreground">• Week {milestone.week}</span>
                  {isCurrent && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                      This Week
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{milestone.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
