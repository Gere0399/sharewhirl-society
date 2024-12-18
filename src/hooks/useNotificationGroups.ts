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

      // First fetch all notification groups
      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching notification groups:", groupsError);
        throw groupsError;
      }

      // Then fetch all notifications with their related data for these groups
      const { data: notifications, error: notificationsError } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (*),
          post:posts (*)
        `)
        .eq("user_id", userId)
        .in(
          "group_id",
          groups.map(g => g.id)
        )
        .order("created_at", { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
      }

      // Create notification groups with their notifications
      const groupsMap = new Map<string, NotificationGroup>();

      groups.forEach(group => {
        groupsMap.set(group.id, {
          id: group.id,
          type: group.type,
          post_id: group.post_id,
          comment_id: group.comment_id,
          notifications: []
        });
      });

      // Add notifications to their respective groups
      notifications?.forEach(notification => {
        const group = groupsMap.get(notification.group_id || "");
        if (group) {
          group.notifications.push(notification as NotificationWithProfiles);
        }
      });

      // Convert map to array and sort by most recent notification
      const groupsArray = Array.from(groupsMap.values())
        .filter(group => group.notifications.length > 0)
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