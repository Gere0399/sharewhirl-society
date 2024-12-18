import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("[NotificationGroups] No user ID provided");
        return [];
      }

      console.log("[NotificationGroups] Fetching notifications for user:", userId);

      try {
        // First, fetch all notifications with their related data
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
          console.error("[NotificationGroups] Error fetching notifications:", notificationsError);
          throw notificationsError;
        }

        console.log("[NotificationGroups] Found notifications:", notifications?.length);
        
        // Group notifications by type and post_id
        const notificationGroups = notifications?.reduce((groups, notification) => {
          const key = `${notification.type}_${notification.post_id || 'null'}`;
          
          if (!groups[key]) {
            console.log(`[NotificationGroups] Creating new group for ${key}`);
            groups[key] = {
              type: notification.type,
              post_id: notification.post_id,
              notifications: []
            };
          }
          
          groups[key].notifications.push(notification);
          return groups;
        }, {} as Record<string, any>);

        console.log("[NotificationGroups] Created groups:", Object.keys(notificationGroups || {}).length);

        // For each group, ensure it exists in the database
        const finalGroups = [];
        for (const [key, group] of Object.entries(notificationGroups || {})) {
          console.log(`[NotificationGroups] Processing group ${key} with ${group.notifications.length} notifications`);
          
          // Find or create group
          const { data: existingGroup } = await supabase
            .from("notification_groups")
            .select("*")
            .eq("user_id", userId)
            .eq("type", group.type)
            .eq("post_id", group.post_id)
            .single();

          let groupId;
          if (existingGroup) {
            console.log(`[NotificationGroups] Found existing group: ${existingGroup.id}`);
            groupId = existingGroup.id;
          } else {
            console.log(`[NotificationGroups] Creating new group for ${key}`);
            const { data: newGroup, error: createError } = await supabase
              .from("notification_groups")
              .insert({
                user_id: userId,
                type: group.type,
                post_id: group.post_id,
                read: false
              })
              .select()
              .single();

            if (createError) {
              console.error(`[NotificationGroups] Error creating group:`, createError);
              continue;
            }
            groupId = newGroup.id;
          }

          // Update notifications with group_id
          const notificationIds = group.notifications.map((n: any) => n.id);
          console.log(`[NotificationGroups] Updating ${notificationIds.length} notifications with group ${groupId}`);
          
          const { error: updateError } = await supabase
            .from("notifications")
            .update({ group_id: groupId })
            .in("id", notificationIds);

          if (updateError) {
            console.error(`[NotificationGroups] Error updating notifications:`, updateError);
            continue;
          }

          finalGroups.push({
            ...group,
            id: groupId,
            notifications: group.notifications
          });
        }

        console.log("[NotificationGroups] Final groups count:", finalGroups.length);
        return finalGroups;
      } catch (error) {
        console.error("[NotificationGroups] Error in useNotificationGroups:", error);
        throw error;
      }
    },
    enabled: !!userId,
  });
};