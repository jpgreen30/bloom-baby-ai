import { Check, X } from "lucide-react";

const ComparisonTable = () => {
  const features = [
    { name: "AI Milestone Predictions", us: true, others: false },
    { name: "Google Calendar Sync", us: true, others: false },
    { name: "Marketplace Built-in", us: true, others: false },
    { name: "Community Support", us: true, others: "Limited" },
    { name: "$400 Welcome Bonus", us: true, others: false },
    { name: "Price", us: "FREE", others: "$9.99/mo" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground">
        Why Parents Choose Baby to Bloom
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-4 px-4 text-muted-foreground font-semibold">Feature</th>
              <th className="py-4 px-4 text-center">
                <div className="font-bold text-primary text-lg">Baby to Bloom</div>
              </th>
              <th className="py-4 px-4 text-center text-muted-foreground font-semibold">Others</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/5">
                <td className="py-4 px-4 text-foreground">{feature.name}</td>
                <td className="py-4 px-4 text-center">
                  {typeof feature.us === "boolean" ? (
                    feature.us ? (
                      <Check className="w-6 h-6 text-accent mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-destructive/50 mx-auto" />
                    )
                  ) : (
                    <span className="font-semibold text-accent">{feature.us}</span>
                  )}
                </td>
                <td className="py-4 px-4 text-center">
                  {typeof feature.others === "boolean" ? (
                    feature.others ? (
                      <Check className="w-6 h-6 text-muted-foreground mx-auto" />
                    ) : (
                      <X className="w-6 h-6 text-destructive/50 mx-auto" />
                    )
                  ) : (
                    <span className="text-muted-foreground">{feature.others}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ComparisonTable;
