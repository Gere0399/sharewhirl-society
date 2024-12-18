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

      // First, get all notifications with their related data
      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (*),
          post:posts (*),
          group:notification_groups!inner (*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
      }

      // Group notifications by their group_id
      const groupedNotifications = notifications.reduce((acc: { [key: string]: NotificationGroup }, notification) => {
        if (!notification.group) return acc;
        
        const group = notification.group;
        if (!acc[group.id]) {
          acc[group.id] = {
            id: group.id,
            type: group.type,
            post_id: group.post_id,
            comment_id: group.comment_id,
            notifications: []
          };
        }
        
        // Add the notification to its group, excluding the group property
        const { group: _, ...notificationWithoutGroup } = notification;
        acc[group.id].notifications.push(notificationWithoutGroup as NotificationWithProfiles);
        
        return acc;
      }, {});

      // Convert the grouped notifications object to an array
      const results = Object.values(groupedNotifications);
      
      console.log("Final notification groups:", results);
      return results;
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};