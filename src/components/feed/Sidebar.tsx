import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Bell,
  User,
  Paintbrush,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarLogo } from "./sidebar/SidebarLogo";
import { SidebarNavItem } from "./sidebar/SidebarNavItem";
import { CreatePostDialog } from "./CreatePostDialog";
import { SidebarOptionsMenu } from "./sidebar/SidebarOptionsMenu";

export function Sidebar() {
  const location = useLocation();
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

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col bg-background border-r border-border/10">
      <div className="flex-none">
        <SidebarLogo />
      </div>

      <nav className="flex-1 flex flex-col items-center justify-center gap-2">
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
          to="/generate"
          icon={Paintbrush}
          label="Generate"
          isActive={location.pathname === "/generate"}
        />

        <SidebarNavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          isActive={location.pathname === "/notifications"}
        />

        <SidebarNavItem
          to={username ? `/profile/${username}` : "/"}
          icon={User}
          label="Profile"
          isActive={location.pathname.startsWith("/profile")}
        />
      </nav>

      <div className="flex-none p-2">
        <SidebarOptionsMenu />
      </div>

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </aside>
  );
}