import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Baby, Sparkles, Heart, Gift, AlertCircle, TrendingUp } from "lucide-react";
import heroImage from "@/assets/hero-baby.jpg";
import HeroStats from "@/components/landing/HeroStats";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";
import FeaturedIn from "@/components/landing/FeaturedIn";
import GiftPackageBreakdown from "@/components/landing/GiftPackageBreakdown";
import ComparisonTable from "@/components/landing/ComparisonTable";
import UrgencyTimer from "@/components/landing/UrgencyTimer";
import FAQAccordion from "@/components/landing/FAQAccordion";
import TrustBadges from "@/components/landing/TrustBadges";
import HowItWorks from "@/components/landing/HowItWorks";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Value Proposition Banner */}
      <div className="bg-gradient-to-r from-accent via-primary to-accent py-3 text-center text-primary-foreground">
        <div className="container mx-auto px-4">
          <p className="text-sm md:text-base font-semibold flex flex-wrap items-center justify-center gap-2">
            <Gift className="w-5 h-5" />
            <span>NEW MEMBER BONUS: $400 in Free Baby Essentials</span>
            <span className="hidden md:inline">✓ Premium diapers ✓ Baby care products ✓ Educational toys ✓ Exclusive marketplace deals</span>
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
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
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-foreground/20 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-semibold">Limited Offer - Only 247 spots left!</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Get $400 in FREE Baby Essentials + AI-Powered Milestone Tracking
            </h1>
            
            <div className="flex items-center justify-center gap-1 text-sm md:text-base">
              <span>⭐⭐⭐⭐⭐</span>
              <span className="ml-2">Rated 4.9/5 by 12,000+ parents</span>
            </div>
            
            <p className="text-lg md:text-2xl opacity-90 max-w-3xl mx-auto">
              Join 50,000+ parents tracking their baby's development with intelligent predictions and personalized guidance. Limited time offer!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                onClick={() => navigate("/onboarding")} 
                className="text-lg bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Claim Your $400 FREE Gift Package →
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate("/auth")} 
                className="text-lg bg-card/20 backdrop-blur-sm border-primary-foreground/20 hover:bg-card/30 text-primary-foreground"
              >
                Sign In
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm pt-2">
              <span className="flex items-center gap-1">✓ No credit card required</span>
              <span className="flex items-center gap-1">✓ Takes 30 seconds</span>
              <span className="flex items-center gap-1">✓ Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <HeroStats />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Trusted by Parents Everywhere
          </h2>
          <TestimonialCarousel />
        </div>
      </section>

      {/* Gift Package Breakdown */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <GiftPackageBreakdown />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <HowItWorks />
        </div>
      </section>

      {/* Features Section - Benefits Driven */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Everything You Need in One App
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-primary/40 transition-all">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Baby className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Never Miss a Developmental Moment</h3>
              <p className="text-muted-foreground">Track 200+ developmental milestones automatically with our intelligent checklist system</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-accent/40 transition-all">
              <div className="w-16 h-16 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Know What's Coming Next (Before It Happens)</h3>
              <p className="text-muted-foreground">85% accuracy in predicting next milestone timeline using advanced AI predictions</p>
            </div>
            <div className="text-center space-y-4 p-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border hover:border-secondary/40 transition-all">
              <div className="w-16 h-16 mx-auto bg-secondary/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get Pediatrician-Approved Guidance 24/7</h3>
              <p className="text-muted-foreground">Access 10,000+ expert-written articles and videos to support your baby's growth</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured In */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <FeaturedIn />
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ComparisonTable />
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <TrustBadges />
        </div>
      </section>

      {/* Urgency Timer */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <UrgencyTimer />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <FAQAccordion />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-primary via-accent to-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
            Ready to Track Your Baby's Journey?
          </h2>
          <p className="text-xl md:text-2xl opacity-90">
            Join 50,000+ Parents Today
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/onboarding")}
            className="text-lg bg-background text-foreground hover:bg-background/90 shadow-xl px-12 py-6 h-auto"
          >
            Claim Your $400 FREE Gift Package →
          </Button>
          <div className="flex flex-col items-center gap-2 text-sm pt-4">
            <span className="flex items-center gap-2">✓ No credit card required</span>
            <span className="flex items-center gap-2">✓ Takes 30 seconds to sign up</span>
            <span className="flex items-center gap-2">✓ Cancel anytime</span>
          </div>
          <p className="text-xs opacity-75 pt-4">
            🔥 127 parents claimed their package in the last 24 hours
          </p>
        </div>
      </section>
    </div>
  );
};

export default Index;
