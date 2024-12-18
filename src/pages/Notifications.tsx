import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader } from "lucide-react";

interface NotificationGroup {
  id: string;
  type: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
  user_id: string;
}

interface Notification {
  id: string;
  type: string;
  actor_id: string;
  post_id?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url?: string;
  };
}

const Notifications = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: notificationGroups, isLoading } = useQuery({
    queryKey: ["notification-groups", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (groupsError) {
        toast({
          title: "Error fetching notifications",
          description: groupsError.message,
          variant: "destructive",
        });
        return [];
      }

      if (!groups) return [];

      const notificationsPromises = groups.map(async (group: NotificationGroup) => {
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            profiles:actor_id (
              username,
              avatar_url
            )
          `)
          .eq("user_id", session.user.id)
          .eq("type", group.type)
          .eq(group.post_id ? "post_id" : "id", group.post_id || "no-match")
          .order("created_at", { ascending: false })
          .limit(3);

        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
          return {
            ...group,
            notifications: [],
          };
        }

        return {
          ...group,
          notifications: notifications || [],
        };
      });

      return Promise.all(notificationsPromises);
    },
    enabled: !!session?.user?.id,
  });

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {notificationGroups?.map((group) => (
                  group.notifications?.map((notification: Notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      isMobile={isMobile}
                    />
                  ))
                ))}
                {(!notificationGroups || notificationGroups.length === 0) && (
                  <p className="text-center text-muted-foreground">
                    No notifications yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;