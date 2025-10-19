import { UserPlus, FileText, Gift } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Sign Up Free",
      description: "30 seconds",
      detail: "No credit card",
    },
    {
      icon: FileText,
      title: "Enter Baby Info",
      description: "2 minutes",
      detail: "Answer 5 questions",
    },
    {
      icon: Gift,
      title: "Get Your Gifts",
      description: "Instant access",
      detail: "$400 in essentials",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
        Get Started in 3 Simple Steps
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="relative text-center space-y-4">
            <div className="relative">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <step.icon className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-accent-foreground">
                {index + 1}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-lg text-primary font-medium">{step.description}</p>
              <p className="text-sm text-muted-foreground">{step.detail}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-accent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
