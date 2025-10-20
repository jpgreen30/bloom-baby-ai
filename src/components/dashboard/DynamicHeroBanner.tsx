import { Button } from "@/components/ui/button";
import { Gift, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DynamicHeroBannerProps {
  babyName?: string;
  aiSummary: string;
  onClaimFreebie: () => void;
}

export const DynamicHeroBanner = ({ babyName, aiSummary, onClaimFreebie }: DynamicHeroBannerProps) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gradient-hero px-4 py-8 md:py-12 mb-6">
      <div className="max-w-2xl mx-auto text-center space-y-4">
        {/* AI Summary */}
        <div className="flex items-center justify-center gap-2 text-white/90">
          <Sparkles className="w-5 h-5" />
          <p className="text-lg md:text-xl font-medium animate-fade-in">
            {aiSummary || `Welcome back! Let's track ${babyName}'s journey.`}
          </p>
        </div>

        {/* CTA Button */}
        <Button
          onClick={onClaimFreebie}
          size="lg"
          className="bg-white text-primary hover:bg-white/90 shadow-glow font-semibold gap-2"
        >
          <Gift className="w-5 h-5" />
          Claim Your $400 in Free Baby Essentials
        </Button>

        <p className="text-white/80 text-sm">
          Limited time offer for new members
        </p>
      </div>
    </div>
  );
};
