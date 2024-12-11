import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Bell,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreatePostDialog } from "./CreatePostDialog";
import { useState, useEffect } from "react";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40">
      <SidebarLogo />

      <nav className="flex-1 flex flex-col items-center gap-2 p-2">
        <SidebarNavItem
          to="/"
          icon={Home}
          label="Home"
          isActive={location.pathname === "/"}
        />

        <SidebarNavItem
          to="#"
          icon={PlusCircle}
          label="Create Post"
          asButton
          onClick={() => setIsCreatePostOpen(true)}
        />

        <SidebarNavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          isActive={location.pathname === "/notifications"}
        />

        <SidebarNavItem
          to="/settings"
          icon={Settings}
          label="Settings"
          isActive={location.pathname === "/settings"}
        />

        <SidebarNavItem
          to={username ? `/profile/${username}` : "/"}
          icon={User}
          label="Profile"
          isActive={location.pathname.startsWith("/profile")}
        />
      </nav>

      <div className="p-2">
        <SidebarNavItem
          to="#"
          icon={LogOut}
          label="Sign Out"
          asButton
          onClick={handleSignOut}
        />
      </div>

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </aside>
  );
}