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
      variant="ghost"
      size="icon"
      asChild={!asButton}
      onClick={onClick}
      className={cn(
        "relative h-14 w-14 hover:bg-secondary/70",
        // Default unselected state - lighter gray color except for post/logo
        label !== "Create Post" && !isActive && "text-[#aaadb0]",
        // Hover and active states
        label === "Create Post" && "hover:bg-[hsl(262,83%,74%)] hover:text-white group",
        // Selected state - white for regular icons, purple for post
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
          style={{ transform: 'scale(1.2)' }}
        />
        <span className="sr-only">{label}</span>
      </ButtonOrLink>
      {/* Add hover indicator for Create Post button */}
      {label === "Create Post" && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[hsl(262,83%,74%)] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </Button>
  );
}