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
          notification_groups!inner (
            id,
            type,
            post_id,
            comment_id,
            created_at,
            read
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
      }

      // Group notifications by their group_id
      const groupedNotifications = notifications.reduce((acc: { [key: string]: NotificationGroup }, notification) => {
        const group = notification.notification_groups;
        if (!group) return acc;

        if (!acc[group.id]) {
          acc[group.id] = {
            id: group.id,
            type: group.type,
            post_id: group.post_id,
            comment_id: group.comment_id,
            notifications: []
          };
        }

        // Add the notification to its group
        acc[group.id].notifications.push({
          id: notification.id,
          user_id: notification.user_id,
          actor_id: notification.actor_id,
          type: notification.type,
          content: notification.content,
          post_id: notification.post_id,
          read: notification.read,
          created_at: notification.created_at,
          updated_at: notification.updated_at,
          group_id: notification.group_id,
          actor: notification.actor,
          post: notification.post
        });

        return acc;
      }, {});

      // Convert the grouped notifications object to an array
      const groupsWithNotifications = Object.values(groupedNotifications);

      console.log("Final notification groups:", groupsWithNotifications);
      return groupsWithNotifications;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};