import { useState, useEffect } from "react";
import { CheckSquare, ShoppingBag, FileText, Car, UtensilsCrossed } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  trimester: number;
  category: string;
}

interface PreparationChecklistCardProps {
  trimester: number;
  babyId: string;
}

const checklistItems: ChecklistItem[] = [
  // Trimester 1
  { id: "t1-1", title: "Choose Healthcare Provider", description: "Select OB/GYN or midwife", icon: "Heart", trimester: 1, category: "Medical" },
  { id: "t1-2", title: "Start Prenatal Vitamins", description: "Folic acid is essential", icon: "Pill", trimester: 1, category: "Health" },
  { id: "t1-3", title: "Review Insurance Coverage", description: "Understand maternity benefits", icon: "FileText", trimester: 1, category: "Planning" },
  
  // Trimester 2
  { id: "t2-1", title: "Research Parenting Classes", description: "Childbirth and newborn care", icon: "GraduationCap", trimester: 2, category: "Education" },
  { id: "t2-2", title: "Plan Nursery Layout", description: "Furniture, colors, themes", icon: "Home", trimester: 2, category: "Home" },
  { id: "t2-3", title: "Start Baby Registry", description: "Create wish list for shower", icon: "Gift", trimester: 2, category: "Planning" },
  { id: "t2-4", title: "Buy Maternity Clothes", description: "Comfortable clothing for growing belly", icon: "ShoppingBag", trimester: 2, category: "Personal" },
  
  // Trimester 3
  { id: "t3-1", title: "Pack Hospital Bag", description: "Essentials for labor and delivery", icon: "Luggage", trimester: 3, category: "Preparation" },
  { id: "t3-2", title: "Install Car Seat", description: "Get professionally inspected", icon: "Car", trimester: 3, category: "Safety" },
  { id: "t3-3", title: "Create Birth Plan", description: "Discuss preferences with provider", icon: "FileText", trimester: 3, category: "Medical" },
  { id: "t3-4", title: "Prep & Freeze Meals", description: "Stock up for postpartum", icon: "UtensilsCrossed", trimester: 3, category: "Home" },
  { id: "t3-5", title: "Tour Birth Facility", description: "Know where to go when labor starts", icon: "Building", trimester: 3, category: "Preparation" },
  { id: "t3-6", title: "Choose Pediatrician", description: "Interview and select baby's doctor", icon: "Stethoscope", trimester: 3, category: "Medical" },
  { id: "t3-7", title: "Wash Baby Clothes", description: "Prep onesies, sleepers, blankets", icon: "Shirt", trimester: 3, category: "Home" },
];

const iconMap: Record<string, any> = {
  "ShoppingBag": ShoppingBag,
  "FileText": FileText,
  "Car": Car,
  "UtensilsCrossed": UtensilsCrossed,
};

export const PreparationChecklistCard = ({ trimester, babyId }: PreparationChecklistCardProps) => {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem(`checklist-${babyId}`);
    if (stored) {
      setCompletedItems(new Set(JSON.parse(stored)));
    }
  }, [babyId]);

  const handleToggle = (itemId: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
    localStorage.setItem(`checklist-${babyId}`, JSON.stringify([...newCompleted]));
  };

  const trimesterItems = checklistItems.filter(item => item.trimester === trimester);
  const completionRate = Math.round((completedItems.size / trimesterItems.length) * 100);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-bold text-foreground">Preparation Checklist</h3>
        </div>
        <span className="text-sm font-semibold text-primary">
          {completionRate}% Complete
        </span>
      </div>

      <div className="mb-4 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${completionRate}%` }}
        />
      </div>

      <div className="space-y-2">
        {trimesterItems.map(item => {
          const Icon = iconMap[item.icon] || CheckSquare;
          const isComplete = completedItems.has(item.id);
          
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                isComplete 
                  ? 'bg-success/10 border-success/30' 
                  : 'bg-card border-border hover:border-primary/40'
              }`}
            >
              <Checkbox
                checked={isComplete}
                onCheckedChange={() => handleToggle(item.id)}
                className="mt-0.5"
              />
              
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isComplete ? 'text-success' : 'text-primary'}`} />
              
              <div className="flex-1">
                <p className={`font-medium ${isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium whitespace-nowrap">
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
