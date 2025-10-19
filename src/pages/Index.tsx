import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Baby, Sparkles, Heart, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-baby.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-accent/60 to-background/90" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-primary-foreground">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-card/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/20">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm">AI-Powered Milestone Tracking</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Baby to Bloom AI
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              Track, celebrate, and predict your baby's developmental milestones with intelligent AI insights
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={() => navigate("/onboarding")} className="text-lg">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/auth")} className="text-lg bg-card/20 backdrop-blur-sm border-primary-foreground/20 hover:bg-card/30">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Baby className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Track Milestones</h3>
              <p className="text-muted-foreground">Easy checklist for motor, cognitive, social, and language development</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">AI Predictions</h3>
              <p className="text-muted-foreground">Smart insights about what's coming next in your baby's journey</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">Expert Tips</h3>
              <p className="text-muted-foreground">Evidence-based guidance to support your baby's growth</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
