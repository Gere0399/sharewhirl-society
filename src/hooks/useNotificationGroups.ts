import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type NotificationGroup = {
  id: string;
  type: string;
  post_id?: string | null;
  notifications: Array<Tables<"notifications"> & {
    actor: Tables<"profiles">;
    post?: Tables<"posts">;
  }>;
};

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      // First, fetch all notification groups
      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching notification groups:", groupsError);
        return [];
      }

      // Then, fetch notifications for these groups with their related data
      const notificationPromises = groups.map(async (group) => {
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:profiles!notifications_actor_id_fkey (*),
            post:posts (*)
          `)
          .eq("group_id", group.id)
          .order("created_at", { ascending: false });

        if (notificationsError) {
          console.error("Error fetching notifications for group:", notificationsError);
          return null;
        }

        return {
          id: group.id,
          type: group.type,
          post_id: group.post_id,
          notifications: notifications || []
        };
      });

      const results = await Promise.all(notificationPromises);
      return results.filter((group): group is NotificationGroup => 
        group !== null && group.notifications.length > 0
      );
    },
    enabled: !!userId,
  });
};