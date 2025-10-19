import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Step5Props {
  userData: {
    firstName: string;
    babyName: string;
    babyStatus: "pregnant" | "born";
  };
}

export const OnboardingStep5 = ({ userData }: Step5Props) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle2 className="h-16 w-16 text-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Welcome, {userData.firstName}! 🎉</h2>
        <p className="text-lg text-muted-foreground">
          Your personalized Baby to Bloom journey is ready
        </p>
      </div>

      <div className="bg-secondary/30 rounded-lg p-6 space-y-3 text-left">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Personalized for {userData.babyName}</p>
            <p className="text-sm text-muted-foreground">
              {userData.babyStatus === "born" 
                ? "Track milestones and get AI-powered insights tailored to your baby's development"
                : "Follow your pregnancy week-by-week with personalized prenatal guidance"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Smart Recommendations</p>
            <p className="text-sm text-muted-foreground">
              Get AI-curated product suggestions from our marketplace based on your baby's age and needs
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Community Support</p>
            <p className="text-sm text-muted-foreground">
              Connect with other parents and share your journey
            </p>
          </div>
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full"
        onClick={() => navigate("/dashboard")}
      >
        Start Your Journey
      </Button>
    </div>
  );
};
