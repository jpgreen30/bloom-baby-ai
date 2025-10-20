import { Calendar, Baby, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PregnancyProgressCardProps {
  dueDate: string;
  currentWeek: number;
  trimester: number;
}

const babySizeByWeek: Record<number, string> = {
  4: "poppy seed", 5: "sesame seed", 6: "lentil", 7: "blueberry", 8: "raspberry",
  9: "cherry", 10: "strawberry", 11: "lime", 12: "plum", 13: "lemon",
  14: "peach", 15: "apple", 16: "avocado", 17: "pear", 18: "bell pepper",
  19: "mango", 20: "banana", 21: "carrot", 22: "papaya", 23: "grapefruit",
  24: "cantaloupe", 25: "cauliflower", 26: "lettuce", 27: "cabbage", 28: "eggplant",
  29: "butternut squash", 30: "cucumber", 31: "coconut", 32: "jicama", 33: "pineapple",
  34: "butternut squash", 35: "honeydew", 36: "romaine lettuce", 37: "swiss chard",
  38: "leek", 39: "mini watermelon", 40: "small pumpkin"
};

export const PregnancyProgressCard = ({ dueDate, currentWeek, trimester }: PregnancyProgressCardProps) => {
  const progressPercentage = Math.min((currentWeek / 40) * 100, 100);
  const weeksRemaining = Math.max(40 - currentWeek, 0);
  const daysRemaining = weeksRemaining * 7;
  const babySize = babySizeByWeek[currentWeek] || "growing baby";
  
  const dueDateObj = new Date(dueDate);
  const formattedDueDate = dueDateObj.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const trimesterColor = {
    1: "from-pregnancy-pink to-pink-300",
    2: "from-pregnancy-lavender to-purple-300",
    3: "from-pregnancy-yellow to-yellow-300"
  }[trimester] || "from-pregnancy-pink to-pink-300";

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-muted/20 border-2 border-primary/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-1">Week {currentWeek}</h2>
          <p className="text-muted-foreground">Trimester {trimester} • {weeksRemaining} weeks to go</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-primary">{Math.round(progressPercentage)}%</p>
          <p className="text-sm text-muted-foreground">Complete</p>
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progressPercentage} className="h-4" />
        <div className={`mt-2 h-2 rounded-full bg-gradient-to-r ${trimesterColor} opacity-50`} 
             style={{ width: `${progressPercentage}%` }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
          <Baby className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Baby Size</p>
            <p className="font-semibold text-foreground capitalize">{babySize}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
          <Calendar className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Due Date</p>
            <p className="font-semibold text-foreground">{formattedDueDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50">
          <TrendingUp className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">Days Remaining</p>
            <p className="font-semibold text-foreground">{daysRemaining} days</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
