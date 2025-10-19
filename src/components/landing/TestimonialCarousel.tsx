import { useState, useEffect } from "react";
import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    quote: "This app predicted my baby's first words a week before it happened! The AI insights are incredible. Plus the $400 in free products was a game-changer for our budget.",
    author: "Sarah M., Mom of 2",
    location: "Los Angeles, CA",
  },
  {
    quote: "Never thought tracking milestones could be this easy. The Google Calendar integration means I never miss a checkup. Worth way more than the free trial!",
    author: "Michael T., First-time Dad",
    location: "New York, NY",
  },
  {
    quote: "Managing two babies was overwhelming until I found Baby to Bloom. The AI predictions help me prepare for what's next. The marketplace saved us thousands!",
    author: "Priya K., Mom of twins",
    location: "Austin, TX",
  },
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="relative min-h-[280px]">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <TestimonialCard {...testimonial} />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
            }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TestimonialCarousel;
