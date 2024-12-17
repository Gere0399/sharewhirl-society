import { useState, useEffect } from "react";
import { Sidebar } from "@/components/feed/Sidebar";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface Notification {
  id: string;
  created_at: string;
  type: string;
  content: string;
  read: boolean; // Changed from is_read to match database schema
  user_id: string;
  actor_id: string;
  post_id?: string;
  actor?: {
    username: string;
    avatar_url: string;
  };
}

export default function Notifications() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(notifications.map(notification => ({
        ...notification,
        read: true
      })));

      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error("Error marking notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <div className="container max-w-3xl py-4 md:py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={loading || notifications.every(n => n.read)}
            >
              <BellOff className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4 rounded-lg border p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
              ))
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
                <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="font-semibold">No notifications yet</h3>
                <p className="text-sm text-muted-foreground">
                  When someone interacts with your content, you'll see it here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-4 rounded-lg border p-4 ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                >
                  <Link
                    to={`/profile/${notification.actor?.username}`}
                    className="shrink-0"
                  >
                    <img
                      src={notification.actor?.avatar_url || "/default-avatar.png"}
                      alt={notification.actor?.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <Link
                        to={`/profile/${notification.actor?.username}`}
                        className="font-semibold hover:underline"
                      >
                        {notification.actor?.username}
                      </Link>{" "}
                      {notification.content}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <CreatePostDialog isOpen={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </div>
  );
}
