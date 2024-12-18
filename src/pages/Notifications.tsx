import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/feed/Sidebar";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Tables } from "@/integrations/supabase/types";
import { useIsMobile } from "@/hooks/use-mobile";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

type NotificationGroup = Tables<"notification_groups"> & {
  notifications: NotificationWithProfiles[];
};

const Notifications = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const isMobile = useIsMobile();

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
    queryKey: ["notification-groups"],
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
        console.error("Error fetching notification groups:", groupsError);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
        return [];
      }

      const notificationsPromises = groups.map(async (group) => {
        const { data: notifications } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:actor_id (
              user_id,
              username,
              avatar_url
            ),
            post:posts (
              id,
              title,
              content
            )
          `)
          .eq("type", group.type)
          .eq("post_id", group.post_id)
          .order("created_at", { ascending: false })
          .returns<NotificationWithProfiles[]>();

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
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {notificationGroups?.map((group) => (
                  group.notifications[0] && (
                    <NotificationItem
                      key={group.id}
                      notification={group.notifications[0]}
                      groupId={group.id}
                    />
                  )
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
      </main>
    </div>
  );
};

export default Notifications;