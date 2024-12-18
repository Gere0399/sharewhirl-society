import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID found");
        return [];
      }

      console.log("Fetching notifications for user:", userId);

      try {
        // First get the notification groups
        const { data: groups, error: groupsError } = await supabase
          .from("notification_groups")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          throw groupsError;
        }

        // For each group, fetch the associated notifications
        const groupsWithNotifications = await Promise.all(
          groups.map(async (group) => {
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
                post:post_id (*)
              `)
              .eq("user_id", userId)
              .eq("type", group.type)
              .eq(group.post_id ? "post_id" : "id", group.post_id || "no-match")
              .order("created_at", { ascending: false })
              .limit(3);

            if (notificationsError) {
              console.error("Error fetching notifications:", notificationsError);
              return { ...group, notifications: [] };
            }

            return { ...group, notifications: notifications || [] };
          })
        );

        return groupsWithNotifications;
      } catch (error) {
        console.error("Error in useNotificationGroups:", error);
        return [];
      }
    },
    enabled: !!userId,
  });
};