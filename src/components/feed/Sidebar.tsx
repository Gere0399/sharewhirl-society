import { Home, Bell, User, Settings, LogOut, LogIn, Share2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <aside className="fixed left-0 top-0 h-screen flex flex-col items-center justify-center gap-4 px-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="space-y-2">
        <Button 
          variant="ghost" 
          size="icon"
          className="relative group w-12 h-12"
          asChild
        >
          <Link to="/">
            <Home className="h-5 w-5" />
            <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              Home
            </span>
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          className="relative group w-12 h-12"
          asChild
        >
          <Link to="/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              Notifications
            </span>
          </Link>
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          className="relative group w-12 h-12"
          asChild
        >
          <Link to="/share">
            <Share2 className="h-5 w-5" />
            <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
              Share
            </span>
          </Link>
        </Button>

        {profile ? (
          <>
            <Button 
              variant="ghost" 
              size="icon"
              className="relative group w-12 h-12"
              asChild
            >
              <Link to={`/profile/${profile.username}`}>
                <User className="h-5 w-5" />
                <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                  Profile
                </span>
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="relative group w-12 h-12"
              asChild
            >
              <Link to="/settings">
                <Settings className="h-5 w-5" />
                <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                  Settings
                </span>
              </Link>
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              className="relative group w-12 h-12 text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                Logout
              </span>
            </Button>
          </>
        ) : (
          <Button 
            variant="ghost" 
            size="icon"
            className="relative group w-12 h-12"
            asChild
          >
            <Link to="/">
              <LogIn className="h-5 w-5" />
              <span className="absolute left-14 bg-popover px-2 py-1 rounded invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
                Login
              </span>
            </Link>
          </Button>
        )}
      </nav>
    </aside>
  );
}