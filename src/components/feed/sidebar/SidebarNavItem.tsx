import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarNavItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  isActive?: boolean;
  hasNotification?: boolean;
  asButton?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({ 
  icon: Icon,
  label, 
  to,
  isActive,
  hasNotification,
  asButton,
  onClick
}: SidebarNavItemProps) {
  const content = (
    <>
      {hasNotification && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      )}
      <Icon className="w-5 h-5" />
    </>
  );

  const className = cn(
    "relative flex items-center justify-center w-12 h-12 mt-2 mb-2 mx-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded transition-colors group",
    isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
  );

  if (asButton) {
    return (
      <button 
        onClick={onClick}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      to={to}
      className={className}
    >
      {content}
    </Link>
  );
}