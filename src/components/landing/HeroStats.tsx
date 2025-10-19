import { Users, TrendingUp, Calendar, Star } from "lucide-react";

const HeroStats = () => {
  const stats = [
    { icon: Users, value: "50,000+", label: "Happy Parents" },
    { icon: TrendingUp, value: "2.5M+", label: "Milestones Tracked" },
    { icon: Calendar, value: "15,000+", label: "Daily Active Users" },
    { icon: Star, value: "4.9", label: "Average Rating" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto mt-12">
      {stats.map((stat, index) => (
        <div key={index} className="text-center space-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
          <stat.icon className="w-8 h-8 mx-auto text-accent" />
          <div className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};

export default HeroStats;
