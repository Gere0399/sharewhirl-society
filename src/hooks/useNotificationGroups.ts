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
        // First, check raw notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:profiles!notifications_actor_id_fkey (*),
            post:posts (*)
          `)
          .eq("user_id", userId);
        
        console.log("Raw notifications:", notifications);
        console.log("Notifications details:", notifications?.map(n => ({
          id: n.id,
          type: n.type,
          group_id: n.group_id,
          actor_id: n.actor_id,
          actor: n.actor?.username,
          created_at: n.created_at,
          post_id: n.post_id
        })));
        
        if (notificationsError) {
          console.error("Error fetching notifications:", notificationsError);
        }

        // Then check groups with their notifications
        const { data: groups, error: groupsError } = await supabase
          .from("notification_groups")
          .select(`
            *,
            notifications!inner (
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

        console.log("Raw notification groups:", groups);
        
        // Log detailed group information
        groups?.forEach(group => {
          console.log(`Group ${group.id} full details:`, {
            id: group.id,
            type: group.type,
            notifications_count: group.notifications?.length || 0,
            notifications: group.notifications?.map(n => ({
              id: n.id,
              type: n.type,
              actor: n.actor?.username,
              created_at: n.created_at,
              group_id: n.group_id
            })),
            post_id: group.post_id,
            created_at: group.created_at
          });
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