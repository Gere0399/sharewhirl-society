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

      console.log("[Notifications] Starting fetch for user:", userId);

      try {
        // First, fetch notifications with their related data
        const { data: notifications, error: notificationsError } = await supabase
          .from("notifications")
          .select(`
            *,
            actor:profiles!notifications_actor_id_fkey (*),
            post:posts (*),
            group:notification_groups (*)
          `)
          .eq("user_id", userId)
          .order('created_at', { ascending: false });
        
        if (notificationsError) {
          console.error("[Notifications] Error fetching notifications:", notificationsError);
          throw notificationsError;
        }

        console.log("[Notifications] Raw notifications count:", notifications?.length);
        console.log("[Notifications] First notification:", notifications?.[0]);

        // Then fetch groups with their notifications
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
          .order('created_at', { ascending: false });

        if (groupsError) {
          console.error("[Notifications] Error fetching groups:", groupsError);
          throw groupsError;
        }

        console.log("[Notifications] Groups count:", groups?.length);
        if (groups?.length) {
          console.log("[Notifications] First group:", {
            id: groups[0].id,
            type: groups[0].type,
            notifications_count: groups[0].notifications?.length,
            notifications: groups[0].notifications?.map(n => ({
              id: n.id,
              type: n.type,
              actor: n.actor?.username
            }))
          });
        }

        // If we have notifications but they're not grouped
        if (notifications?.length && notifications.some(n => !n.group_id)) {
          console.log("[Notifications] Found notifications without groups, creating groups...");
          
          // Group notifications by type and post_id
          const notificationsByGroup = notifications.reduce((acc, notification) => {
            if (notification.group_id) return acc; // Skip already grouped notifications
            
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
            
            console.log(`[Notifications] Creating group for ${key} with ${groupNotifications.length} notifications`);
            
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

            console.log(`[Notifications] Created group ${newGroup.id}, updating notifications...`);

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
              notifications!notifications_group_id_fkey (
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

          console.log("[Notifications] Final groups count:", updatedGroups?.length);
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