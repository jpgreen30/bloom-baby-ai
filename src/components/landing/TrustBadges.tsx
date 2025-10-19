import { Lock, CreditCard, Mail, CheckCircle } from "lucide-react";

const TrustBadges = () => {
  const badges = [
    {
      icon: Lock,
      title: "Secure & Encrypted",
      description: "Your data is encrypted and secure (HIPAA compliant)",
    },
    {
      icon: CreditCard,
      title: "No Credit Card",
      description: "No credit card needed to claim your $400 gift",
    },
    {
      icon: Mail,
      title: "Unsubscribe Anytime",
      description: "Unsubscribe anytime (but you won't want to)",
    },
    {
      icon: CheckCircle,
      title: "Premium Trial",
      description: "14-day premium trial included",
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground">
        100% Free to Start - No Credit Card Required
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {badges.map((badge, index) => (
          <div key={index} className="text-center space-y-3">
            <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <badge.icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{badge.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrustBadges;
