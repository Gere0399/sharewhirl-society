import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("[Notifications] No user ID found");
        return [];
      }

      console.log("[Notifications] Fetching for user:", userId);

      try {
        // First, check raw notifications
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:profiles!notifications_actor_id_fkey (*),
            post:posts (*)
          `)
          .eq("user_id", userId)
          .order('created_at', { ascending: false });
        
        console.log("[Notifications] Raw count:", notifications?.length);
        console.log("[Notifications] Sample notification:", notifications?.[0]);
        
        if (notificationsError) {
          console.error("[Notifications] Error fetching:", notificationsError);
        }

        // Then check groups with their notifications
        const { data: groups, error: groupsError } = await supabase
          .from("notification_groups")
          .select(`
            *,
            notifications (
              *,
              actor:profiles!notifications_actor_id_fkey (*),
              post:posts (*)
            )
          `)
          .eq("user_id", userId)
          .order('created_at', { ascending: false });

        if (groupsError) {
          console.error("[Notifications] Error fetching groups:", groupsError);
          throw groupsError;
        }

        console.log("[Notifications] Groups count:", groups?.length);
        if (groups?.length) {
          console.log("[Notifications] Sample group:", {
            id: groups[0].id,
            type: groups[0].type,
            notifications: groups[0].notifications?.map(n => ({
              id: n.id,
              type: n.type,
              actor: n.actor?.username,
              created_at: n.created_at
            }))
          });
        }

        // If we have notifications but no groups, create groups for them
        if (notifications?.length && (!groups || groups.length === 0)) {
          console.log("[Notifications] Creating missing groups");
          
          // Group notifications by type and post_id
          const notificationsByGroup = notifications.reduce((acc, notification) => {
            const key = `${notification.type}_${notification.post_id || 'null'}`;
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(notification);
            return acc;
          }, {} as Record<string, any[]>);

          // Create groups and update notifications
          for (const [key, groupNotifications] of Object.entries(notificationsByGroup)) {
            const firstNotification = groupNotifications[0];
            
            // Create group
            const { data: newGroup, error: createError } = await supabase
              .from('notification_groups')
              .insert({
                user_id: userId,
                type: firstNotification.type,
                post_id: firstNotification.post_id,
                created_at: firstNotification.created_at
              })
              .select()
              .single();

            if (createError) {
              console.error("[Notifications] Error creating group:", createError);
              continue;
            }

            // Update notifications with group_id
            const { error: updateError } = await supabase
              .from('notifications')
              .update({ group_id: newGroup.id })
              .in('id', groupNotifications.map(n => n.id));

            if (updateError) {
              console.error("[Notifications] Error updating notifications:", updateError);
            }
          }

          // Fetch updated groups
          const { data: updatedGroups, error: refetchError } = await supabase
            .from("notification_groups")
            .select(`
              *,
              notifications (
                *,
                actor:profiles!notifications_actor_id_fkey (*),
                post:posts (*)
              )
            `)
            .eq("user_id", userId)
            .order('created_at', { ascending: false });

          if (refetchError) {
            console.error("[Notifications] Error refetching groups:", refetchError);
            throw refetchError;
          }

          console.log("[Notifications] Created groups count:", updatedGroups?.length);
          return updatedGroups || [];
        }

        return groups || [];
      } catch (error) {
        console.error("[Notifications] Error in useNotificationGroups:", error);
        throw error;
      }
    },
    enabled: !!userId,
  });
};