import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  asButton?: boolean;
}

export function SidebarNavItem({ 
  to, 
  icon: Icon, 
  label, 
  isActive,
  onClick,
  asButton
}: SidebarNavItemProps) {
  const ButtonOrLink = asButton ? Button : Link;
  
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="icon"
      asChild={!asButton}
      onClick={onClick}
    >
      <ButtonOrLink to={to}>
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
      </ButtonOrLink>
    </Button>
  );
}