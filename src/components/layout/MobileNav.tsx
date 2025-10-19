import { useNavigate } from "react-router-dom";
import { Home, Calendar, ShoppingBag, Users, Star } from "lucide-react";

interface MobileNavProps {
  currentPath: string;
}

const MobileNav = ({ currentPath }: MobileNavProps) => {
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: "Home", path: "/dashboard" },
    { icon: Calendar, label: "Appts", path: "/appointments" },
    { icon: ShoppingBag, label: "Shop", path: "/marketplace" },
    { icon: Users, label: "Social", path: "/community" },
    { icon: Star, label: "Premium", path: "/premium" },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px] ${
                active
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
              <span className={`text-xs ${active ? "font-semibold" : "font-medium"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
