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
        "relative hover:bg-secondary/70",
        // Default unselected state - darker color except for post/logo
        label !== "Create Post" && !isActive && "text-[#333333]",
        // Hover and active states
        label === "Create Post" && "hover:bg-[hsl(262,83%,74%)] hover:text-white",
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
        <Icon className="h-6 w-6" /> {/* Increased from h-5 w-5 */}
        <span className="sr-only">{label}</span>
      </ButtonOrLink>
    </Button>
  );
}