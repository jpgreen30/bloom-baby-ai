import { Package, Heart, Sparkles, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const GiftPackageBreakdown = () => {
  const navigate = useNavigate();
  
  const packages = [
    {
      icon: Package,
      title: "Diapers & Wipes",
      value: "$120",
      items: ["Premium diapers", "Sensitive wipes", "Changing pads", "Diaper bag"],
    },
    {
      icon: Heart,
      title: "Baby Care",
      value: "$80",
      items: ["Organic lotions", "Baby shampoo", "Bath essentials", "Sunscreen"],
    },
    {
      icon: Sparkles,
      title: "Educational Toys",
      value: "$100",
      items: ["Learning toys", "Baby books", "Puzzles", "Teethers"],
    },
    {
      icon: Tag,
      title: "Exclusive Deals",
      value: "$100",
      items: ["Marketplace coupons", "Partner discounts", "Premium trials", "Special offers"],
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          Your $400 Welcome Package Includes
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to get started, absolutely free
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg, index) => (
          <Card key={index} className="bg-gradient-to-br from-card to-card/50 border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <pkg.icon className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">{pkg.title}</CardTitle>
              <p className="text-2xl font-bold text-accent">{pkg.value} value</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {pkg.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <Button size="lg" onClick={() => navigate("/onboarding")} className="text-lg px-8">
          Claim Your Free $400 Package Now →
        </Button>
        <p className="text-xs text-muted-foreground">
          * Free essentials provided through our trusted brand partners. Available to first 1,000 new members each month. No credit card required to claim.
        </p>
      </div>
    </div>
  );
};

export default GiftPackageBreakdown;
