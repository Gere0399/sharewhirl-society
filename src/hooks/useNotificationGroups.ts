import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

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
        // First fetch notification groups with their notifications
        const { data: groups, error: groupsError } = await supabase
          .from("notification_groups")
          .select(`
            *,
            notifications!notifications_group_id_fkey (
              *,
              actor:profiles!notifications_actor_id_fkey (*),
              post:posts (*)
            )
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (groupsError) {
          console.error("Error fetching groups:", groupsError);
          throw groupsError;
        }

        console.log("Raw notification groups data:", groups);

        // Log each group's notifications for debugging
        groups?.forEach(group => {
          console.log(`Group ${group.id} has ${group.notifications?.length || 0} notifications:`, 
            group.notifications
          );
        });

        return groups || [];
      } catch (error) {
        console.error("Error in useNotificationGroups:", error);
        throw error;
      }
    },
    enabled: !!userId,
  });
};