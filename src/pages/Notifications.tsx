import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const Notifications = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const queryClient = useQueryClient();

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

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("Subscribing to notifications channel");
    
    const channel = supabase
      .channel('notifications-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Notification change received:', payload);
          // Invalidate the query to refetch notifications
          queryClient.invalidateQueries({ queryKey: ["notification-groups", session.user.id] });
        }
      )
      .subscribe();

    // Also subscribe to notification groups changes
    const groupsChannel = supabase
      .channel('notification-groups-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_groups',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Notification group change received:', payload);
          // Invalidate the query to refetch notifications
          queryClient.invalidateQueries({ queryKey: ["notification-groups", session.user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(groupsChannel);
    };
  }, [session?.user?.id, queryClient]);

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

      const notificationsPromises = (groups || []).map(async (group) => {
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:actor_id (
              id,
              user_id,
              username,
              avatar_url,
              bio,
              followers_count,
              created_at,
              updated_at,
              full_name,
              has_subscription
            ),
            post:post_id (
              id,
              user_id,
              title,
              content,
              media_url,
              created_at,
              updated_at,
              media_type,
              tags,
              is_ai_generated,
              reposted_from_id,
              reposted_from_user_id,
              likes_count,
              comments_count,
              views_count,
              repost_count,
              thumbnail_url
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
          <NotificationsList 
            isLoading={isLoading} 
            groups={notificationGroups} 
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;