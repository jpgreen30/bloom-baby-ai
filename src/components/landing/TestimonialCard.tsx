import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TestimonialCardProps {
  quote: string;
  author: string;
  location: string;
  rating?: number;
}

const TestimonialCard = ({ quote, author, location, rating = 5 }: TestimonialCardProps) => {
  return (
    <Card className="p-6 space-y-4 bg-card/50 backdrop-blur-sm border-primary/10">
      <div className="flex gap-1">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
        ))}
      </div>
      <p className="text-foreground/90 italic">"{quote}"</p>
      <div className="pt-2 border-t border-border">
        <p className="font-semibold text-foreground">{author}</p>
        <p className="text-sm text-muted-foreground">📍 {location}</p>
      </div>
    </Card>
  );
};

export default TestimonialCard;
