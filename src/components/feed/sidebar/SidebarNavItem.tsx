import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SidebarNavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  showNotificationDot?: boolean;
  userId?: string;
}

export const SidebarNavItem = ({ 
  icon, 
  label, 
  href, 
  isActive,
  showNotificationDot,
  userId 
}: SidebarNavItemProps) => {
  const { data: hasUnreadNotifications } = useQuery({
    queryKey: ["unread-notifications", userId],
    queryFn: async () => {
      if (!userId || !showNotificationDot) return false;
      
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", userId)
        .eq("read", false);
      
      if (error) {
        console.error("Error checking unread notifications:", error);
        return false;
      }
      
      return (count || 0) > 0;
    },
    enabled: !!userId && showNotificationDot,
    refetchInterval: 30000 // Check every 30 seconds
  });

  return (
    <Link
      to={href}
      className={cn(
        "relative flex items-center justify-center w-12 h-12 mt-2 mb-2 mx-auto text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded transition-colors group",
        isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
      )}
    >
      {showNotificationDot && hasUnreadNotifications && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
      )}
      {icon}
      <span className="absolute left-full ml-2 px-2 py-1 text-sm bg-sidebar-background rounded-md scale-0 group-hover:scale-100 transition-all">
        {label}
      </span>
    </Link>
  );
};