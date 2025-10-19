import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";

const UrgencyTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 18,
  });

  const [packagesLeft] = useState(247);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-destructive/10 via-accent/10 to-destructive/10 border border-destructive/20 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-center gap-2 text-destructive">
        <AlertCircle className="w-5 h-5" />
        <span className="font-semibold">Limited Time Offer - Only {packagesLeft} packages left this month!</span>
      </div>
      
      <div className="flex justify-center gap-4">
        {[
          { label: "Days", value: timeLeft.days },
          { label: "Hours", value: timeLeft.hours },
          { label: "Minutes", value: timeLeft.minutes },
          { label: "Seconds", value: timeLeft.seconds },
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className="bg-card border border-border rounded-lg p-3 min-w-[60px]">
              <div className="text-2xl md:text-3xl font-bold text-foreground">
                {String(item.value).padStart(2, "0")}
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
          </div>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don't miss out on your $400 in free baby essentials!
      </p>
    </div>
  );
};

export default UrgencyTimer;
