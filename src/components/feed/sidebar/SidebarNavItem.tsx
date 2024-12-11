import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  asButton?: boolean;
  className?: string;
}

export function SidebarNavItem({ 
  to, 
  icon: Icon, 
  label, 
  isActive,
  onClick,
  asButton,
  className
}: SidebarNavItemProps) {
  const ButtonOrLink = asButton ? Button : Link;
  
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      asChild={!asButton}
      onClick={onClick}
      className={cn("relative", className)}
    >
      <ButtonOrLink to={to}>
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </ButtonOrLink>
    </Button>
  );
}