import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  clickable?: boolean;
  to?: string;
  className?: string;
}

const sizeClasses = {
  sm: "h-8",
  md: "h-10",
  lg: "h-12",
  xl: "h-14",
};

export const Logo = ({ 
  size = "md", 
  clickable = true, 
  to = "/",
  className 
}: LogoProps) => {
  const logoElement = (
    <img
      src={logoImage}
      alt="Baby to Bloom AI - Baby Milestone Tracker"
      className={cn(
        sizeClasses[size],
        "w-auto object-contain",
        clickable && "transition-transform duration-200 hover:scale-105 cursor-pointer",
        className
      )}
    />
  );

  if (clickable) {
    return (
      <Link to={to} className="inline-flex items-center">
        {logoElement}
      </Link>
    );
  }

  return logoElement;
};
