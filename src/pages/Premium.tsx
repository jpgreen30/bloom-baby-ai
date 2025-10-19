import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Premium = () => {
  const features = {
    free: [
      "Basic milestone tracking",
      "3 appointments per month",
      "Manual growth tracking",
      "3 product recommendations daily",
      "Community access",
      "10 photo uploads",
      "Weekly AI insights",
      "2 marketplace listings",
    ],
    premium: [
      "Advanced milestone tracking with AI insights",
      "Unlimited appointments + Google Calendar sync",
      "Auto growth tracking with WHO charts",
      "Unlimited product recommendations",
      "Community access with Expert badge",
      "Unlimited photo uploads + albums",
      "Daily AI insights + predictions",
      "Unlimited marketplace listings + featured placement",
      "Export data as PDF reports",
      "Ad-free experience",
      "Priority customer support",
      "Family sharing (up to 4 members)",
    ],
  };

  return (
    <div className="container max-w-6xl py-8 px-4">
      {/* Header */}
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Unlock Premium Features</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold">
          Give Your Baby the Best Start
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get unlimited access to AI-powered insights, advanced tracking, and premium features
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <Card className="relative border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.free.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mt-6" variant="outline" disabled>
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className="relative border-2 border-primary shadow-glow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              Most Popular
            </span>
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">Premium</CardTitle>
            <CardDescription>Everything you need for your baby's journey</CardDescription>
            <div className="pt-4">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-muted-foreground">
              or $89.99/year <span className="text-success">(save 25%)</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {features.premium.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full mb-3">
              Start 14-Day Free Trial
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              No credit card required • Cancel anytime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Family Plan */}
      <Card className="border-2 border-accent">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Family Plan</CardTitle>
              <CardDescription>Share with your partner, grandparents, and caregivers</CardDescription>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">$14.99</div>
              <div className="text-sm text-muted-foreground">/month</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            All Premium features + Share access with up to 4 family members
          </p>
          <Button variant="outline" className="w-full md:w-auto">
            Learn More About Family Plan
          </Button>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
          <div>
            <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! You can cancel your subscription at any time with no penalties.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards, debit cards, and digital wallets.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-sm text-muted-foreground">
              Yes! Try Premium free for 14 days with no credit card required.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Can I upgrade/downgrade later?</h3>
            <p className="text-sm text-muted-foreground">
              Absolutely! Switch plans anytime and we'll prorate the charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;
