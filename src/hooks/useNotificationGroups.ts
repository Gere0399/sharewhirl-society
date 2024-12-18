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

      // First, get all notification groups
      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select(`
          id,
          type,
          post_id,
          comment_id,
          created_at,
          read
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching notification groups:", groupsError);
        throw groupsError;
      }

      // Then, for each group, fetch its notifications separately
      const groupsWithNotifications = await Promise.all(
        groups.map(async (group) => {
          const { data: notifications, error: notificationsError } = await supabase
            .from("notifications")
            .select(`
              *,
              actor:profiles!notifications_actor_id_fkey (*),
              post:posts (*)
            `)
            .eq("group_id", group.id);

          if (notificationsError) {
            console.error("Error fetching notifications for group:", notificationsError);
            return {
              ...group,
              notifications: []
            };
          }

          return {
            ...group,
            notifications: notifications || []
          };
        })
      );

      console.log("Final notification groups:", groupsWithNotifications);
      return groupsWithNotifications;
    },
    enabled: !!userId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
};