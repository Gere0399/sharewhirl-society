import { useLocation, useNavigate } from "react-router-dom";
import {
  Play,
  PlusCircle,
  Bell,
  User,
  Paintbrush,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { SidebarOptionsMenu } from "./sidebar/SidebarOptionsMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  isCreatePostOpen?: boolean;
  setIsCreatePostOpen?: (open: boolean) => void;
}

export function Sidebar({ 
  isCreatePostOpen = false, 
  setIsCreatePostOpen = () => {} 
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data: unreadNotifications } = useQuery({
    queryKey: ["unreadNotifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      return count || 0;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUsername(data.username);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleCreatePost = async () => {
    if (location.pathname !== '/') {
      sessionStorage.setItem('openCreatePost', 'true');
      await navigate('/');
    } else {
      setIsCreatePostOpen(true);
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && sessionStorage.getItem('openCreatePost')) {
      sessionStorage.removeItem('openCreatePost');
      setIsCreatePostOpen(true);
    }
  }, [location.pathname, setIsCreatePostOpen]);

  const mobileNavItems = [
    {
      to: "/generate",
      icon: Paintbrush,
      label: "Generate",
      isActive: location.pathname === "/generate"
    },
    {
      to: "/",
      icon: Play,
      label: "Social Streaming",
      isActive: location.pathname === "/"
    },
    {
      to: "#",
      icon: PlusCircle,
      label: "Create Post",
      asButton: true,
      onClick: handleCreatePost
    },
    {
      to: "/notifications",
      icon: Bell,
      label: "Notifications",
      isActive: location.pathname === "/notifications",
      hasNotification: unreadNotifications && unreadNotifications > 0
    },
    {
      to: username ? `/profile/${username}` : "/",
      icon: User,
      label: "Profile",
      isActive: location.pathname.startsWith("/profile")
    }
  ];

  if (isMobile) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-background/95 backdrop-blur-sm border-t border-border/10 z-50">
        <div className="flex items-center justify-evenly h-full">
          {mobileNavItems.map((item) => (
            <SidebarNavItem
              key={item.label}
              {...item}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 flex flex-col bg-background border-r border-border/10">
      <div className="flex-none">
        <SidebarLogo />
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center gap-1">
        <SidebarNavItem
          to="/generate"
          icon={Paintbrush}
          label="Generate"
          isActive={location.pathname === "/generate"}
        />

        <SidebarNavItem
          to="/"
          icon={Play}
          label="Social Streaming"
          isActive={location.pathname === "/"}
        />

        <SidebarNavItem
          to="#"
          icon={PlusCircle}
          label="Create Post"
          asButton
          onClick={handleCreatePost}
        />

        <SidebarNavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          isActive={location.pathname === "/notifications"}
          hasNotification={unreadNotifications && unreadNotifications > 0}
        />

        <SidebarNavItem
          to={username ? `/profile/${username}` : "/"}
          icon={User}
          label="Profile"
          isActive={location.pathname.startsWith("/profile")}
        />
      </nav>

      <div className="flex items-center justify-center">
        <SidebarOptionsMenu />
      </div>
    </aside>
  );
}
