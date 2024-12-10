import { Home, Bell, User, Settings, LogOut, LogIn, Plus, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CreatePostDialog } from "./CreatePostDialog";
import { useTheme } from "@/hooks/use-theme";

export function Sidebar() {
  const [profile, setProfile] = useState<any>(null);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      setProfile(data);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      navigate('/');
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col justify-center bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/40">
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative group"
          asChild
        >
          <Link to="/">
            <Home className="h-5 w-5" />
            <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
              Home
            </span>
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          className="relative group"
          asChild
        >
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
              Notifications
            </span>
          </Link>
        </Button>

        {profile && (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative group"
              onClick={() => setIsPostDialogOpen(true)}
            >
              <Plus className="h-5 w-5" />
              <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                New Post
              </span>
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="relative group"
              asChild
            >
              <Link to={`/profile/${profile.username}`}>
                <User className="h-5 w-5" />
                <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                  Profile
                </span>
              </Link>
            </Button>
          </>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="relative group"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
          <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
            Toggle Theme
          </span>
        </Button>
      </div>

      <div className="pb-8">
        <div className="w-8 mx-auto mb-4 border-t border-border/40" />
        <div className="flex flex-col items-center gap-4">
          {profile ? (
            <>
              <Button 
                variant="ghost" 
                size="icon"
                className="relative group"
                asChild
              >
                <Link to="/settings">
                  <Settings className="h-5 w-5" />
                  <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                    Settings
                  </span>
                </Link>
              </Button>

              <Button 
                variant="ghost" 
                size="icon"
                className="relative group text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                  Logout
                </span>
              </Button>
            </>
          ) : (
            <Button 
              variant="ghost" 
              size="icon"
              className="relative group"
              asChild
            >
              <Link to="/">
                <LogIn className="h-5 w-5" />
                <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50">
                  Login
                </span>
              </Link>
            </Button>
          )}
        </div>
      </div>

      <CreatePostDialog isOpen={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />
    </aside>
  );
}