import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  Calendar, 
  TrendingUp, 
  Milk, 
  ShoppingBag, 
  Users, 
  Star,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";

interface DesktopSidebarProps {
  currentPath: string;
}

const DesktopSidebar = ({ currentPath }: DesktopSidebarProps) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: TrendingUp, label: "Growth", path: "/growth" },
    { icon: Milk, label: "Trackers", path: "/trackers" },
    { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
    { icon: Users, label: "Community", path: "/community" },
  ];

  const bottomItems = [
    { icon: Star, label: "Premium", path: "/premium", highlight: true },
    { icon: Settings, label: "Settings", path: "/settings" },
    { icon: HelpCircle, label: "Help", path: "/help" },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <aside
      className={cn(
        "sticky top-14 h-[calc(100vh-3.5rem)] border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo & Toggle Section */}
        <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
          {!collapsed && (
            <Logo size="sm" to="/dashboard" />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 ml-auto"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Items */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          {bottomItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                  item.highlight && !active && "text-amber-600 dark:text-amber-400",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary font-semibold"
                    : "hover:bg-sidebar-accent/50",
                  collapsed && "justify-center"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
