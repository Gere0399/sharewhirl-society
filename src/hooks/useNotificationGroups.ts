import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationGroup {
  id: string;
  type: string;
  post_id?: string | null;
  comment_id?: string | null;
  notifications: NotificationWithProfiles[];
}

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID provided to useNotificationGroups");
        return [];
      }

      console.log("Fetching notification groups for user:", userId);

      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (*),
          post:posts (*)
        `)
        .eq("user_id", userId)
        .eq("read", false)
        .order("created_at", { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
      }

      if (!notifications?.length) {
        return [];
      }

      const groups: NotificationGroup[] = [];
      const processedKeys = new Set<string>();

      notifications.forEach(notification => {
        const contextKey = `${notification.type}-${notification.post_id || ''}-${notification.actor_id}`;
        
        if (!processedKeys.has(contextKey)) {
          processedKeys.add(contextKey);
          
          const relatedNotifications = notifications.filter(n => 
            n.type === notification.type && 
            n.post_id === notification.post_id &&
            (notification.type === 'follow' ? 
              n.actor_id === notification.actor_id : 
              true)
          );

          groups.push({
            id: notification.id,
            type: notification.type,
            post_id: notification.post_id,
            comment_id: null,
            notifications: relatedNotifications as NotificationWithProfiles[]
          });
        }
      });

      return groups;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};