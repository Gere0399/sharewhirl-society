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
  hasNotification?: boolean;
}

export function SidebarNavItem({ 
  to, 
  icon: Icon, 
  label, 
  isActive,
  onClick,
  asButton,
  className,
  hasNotification = false
}: SidebarNavItemProps) {
  const ButtonOrLink = asButton ? Button : Link;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      asChild={!asButton}
      onClick={onClick}
      className={cn(
        "relative h-14 w-14 hover:bg-secondary/70",
        label !== "Create Post" && !isActive && "text-[#aaadb0]",
        label === "Create Post" && "hover:bg-[hsl(262,83%,74%)] hover:text-white",
        isActive && (
          label === "Create Post" 
            ? "bg-[hsl(262,83%,74%)] text-white" 
            : "text-white hover:text-white"
        ),
        className
      )}
    >
      <ButtonOrLink to={to}>
        <Icon 
          className="h-5 w-5" 
          style={{ transform: 'scale(1.2)', strokeLinecap: 'round' }}
        />
        {hasNotification && (
          <span className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full bg-red-500" />
        )}
        <span className="sr-only">{label}</span>
      </ButtonOrLink>
    </Button>
  );
}