import { Home, Bell, User, Settings, LogOut, LogIn, Menu } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export function Sidebar() {
  const [profile, setProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

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

  const SidebarContent = () => (
    <nav className="space-y-2">
      <Button variant="ghost" className="w-full justify-start" asChild>
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>
      <Button variant="ghost" className="w-full justify-start" asChild>
        <Link to="/notifications">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </Link>
      </Button>
      {profile ? (
        <>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to={`/profile/${profile.username}`}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link to="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      )}
    </nav>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className="fixed top-4 left-4 z-50"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="py-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-64 border-r border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-screen fixed left-0 top-0 p-4">
      <SidebarContent />
    </aside>
  );
}