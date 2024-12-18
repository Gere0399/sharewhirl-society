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

      // Fetch all notification groups for the user, ordered by most recent first
      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching notification groups:", groupsError);
        throw groupsError;
      }

      console.log("Fetched notification groups:", groups);

      // For each group, fetch its notifications with related data
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
          throw notificationsError;
        }

        console.log(`Fetched notifications for group ${group.id}:`, notifications);

        return {
          id: group.id,
          type: group.type,
          post_id: group.post_id,
          comment_id: group.comment_id,
          notifications: notifications as NotificationWithProfiles[]
        };
      });

      const results = await Promise.all(notificationPromises);
      console.log("Final notification groups:", results);
      return results;
    },
    enabled: !!userId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};