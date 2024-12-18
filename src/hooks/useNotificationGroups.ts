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

      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching notification groups:", groupsError);
        return [];
      }

      console.log("Fetched notification groups:", groups);

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

        console.log(`Fetched notifications for group ${group.id}:`, notifications);

        return {
          id: group.id,
          type: group.type,
          post_id: group.post_id,
          notifications: notifications as NotificationWithProfiles[]
        };
      });

      const results = await Promise.all(notificationPromises);
      const validGroups = results.filter((group): group is NotificationGroup => 
        group !== null && 
        typeof group.id === 'string' && 
        typeof group.type === 'string' && 
        Array.isArray(group.notifications)
      );

      console.log("Final processed notification groups:", validGroups);
      return validGroups;
    },
    enabled: !!userId,
  });
};