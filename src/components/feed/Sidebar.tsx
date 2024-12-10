import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
      <div className="p-2">
        <Link to="/" className="block">
          <img 
            src="/neo-ai-logo.png" 
            alt="Neo AI Studios"
            className="w-12 h-12 mx-auto object-contain"
          />
        </Link>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2 p-2">
        <Button
          variant={location.pathname === "/" ? "default" : "ghost"}
          size="icon"
          asChild
        >
          <Link to="/">
            <Home className="h-5 w-5" />
            <span className="sr-only">Home</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCreatePostOpen(true)}
        >
          <PlusCircle className="h-5 w-5" />
          <span className="sr-only">Create Post</span>
        </Button>

        <Button
          variant={location.pathname === "/notifications" ? "default" : "ghost"}
          size="icon"
          asChild
        >
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>

        <Button
          variant={location.pathname === "/settings" ? "default" : "ghost"}
          size="icon"
          asChild
        >
          <Link to="/settings">
            <Settings className="h-5 w-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>

        <Button
          variant={location.pathname.startsWith("/profile") ? "default" : "ghost"}
          size="icon"
          asChild
        >
          <Link to={username ? `/profile/${username}` : "#"}>
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Link>
        </Button>
      </nav>

      <div className="p-2">
        <Button variant="ghost" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Sign Out</span>
        </Button>
      </div>

      <CreatePostDialog
        isOpen={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      />
    </aside>
  );
}