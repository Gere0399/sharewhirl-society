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

      // Get all notifications with their related data
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
        .order("created_at", { ascending: false })
        .limit(100); // Add a reasonable limit to prevent performance issues

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
      }

      // Create a map to store unique groups
      const groupsMap = new Map<string, NotificationGroup>();

      // Process each notification
      notifications?.forEach(notification => {
        const group = notification.notification_groups;
        if (!group) return;

        // Get or create group
        if (!groupsMap.has(group.id)) {
          groupsMap.set(group.id, {
            id: group.id,
            type: group.type,
            post_id: group.post_id,
            comment_id: group.comment_id,
            notifications: []
          });
        }

        // Add notification to group
        const currentGroup = groupsMap.get(group.id);
        if (currentGroup) {
          currentGroup.notifications.push({
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
        }
      });

      // Convert map to array and sort by most recent notification
      const groupsArray = Array.from(groupsMap.values())
        .sort((a, b) => {
          const aDate = new Date(a.notifications[0]?.created_at || 0);
          const bDate = new Date(b.notifications[0]?.created_at || 0);
          return bDate.getTime() - aDate.getTime();
        });

      console.log("Final notification groups:", groupsArray);
      return groupsArray;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};