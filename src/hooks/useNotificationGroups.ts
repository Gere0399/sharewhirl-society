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
        console.log("[NotificationGroups] No user ID provided");
        return [];
      }

      console.log("[NotificationGroups] Starting fetch for user:", userId);

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

        if (!notifications?.length) {
          return [];
        }

        // Group notifications by type and post_id
        const groupedNotifications = notifications.reduce((groups, notification) => {
          const key = `${notification.type}_${notification.post_id || 'null'}`;
          if (!groups[key]) {
            groups[key] = {
              type: notification.type,
              post_id: notification.post_id,
              notifications: []
            };
          }
          groups[key].notifications.push(notification);
          return groups;
        }, {} as Record<string, Omit<NotificationGroup, "id">>);

        console.log("[NotificationGroups] Created initial groups:", Object.keys(groupedNotifications).length);

        // Process each group
        const finalGroups: NotificationGroup[] = [];
        for (const [key, group] of Object.entries(groupedNotifications)) {
          console.log(`[NotificationGroups] Processing group ${key} with ${group.notifications.length} notifications`);

          // Find existing groups
          let query = supabase
            .from("notification_groups")
            .select("*")
            .eq("user_id", userId)
            .eq("type", group.type);

          // Handle post_id separately
          if (group.post_id === null) {
            query = query.is("post_id", null);
          } else {
            query = query.eq("post_id", group.post_id);
          }

          const { data: existingGroups, error: findError } = await query;

          if (findError) {
            console.error(`[NotificationGroups] Error finding groups:`, findError);
            continue;
          }

          let groupId: string;
          if (existingGroups && existingGroups.length > 0) {
            console.log(`[NotificationGroups] Found existing group: ${existingGroups[0].id}`);
            groupId = existingGroups[0].id;
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
          console.log(`[NotificationGroups] Updating ${group.notifications.length} notifications with group ${groupId}`);
          
          let updateQuery = supabase
            .from("notifications")
            .update({ group_id: groupId })
            .eq("user_id", userId)
            .eq("type", group.type);

          // Handle post_id separately for the update query
          if (group.post_id === null) {
            updateQuery = updateQuery.is("post_id", null);
          } else {
            updateQuery = updateQuery.eq("post_id", group.post_id);
          }

          const { error: updateError } = await updateQuery;

          if (updateError) {
            console.error(`[NotificationGroups] Error updating notifications:`, updateError);
            continue;
          }

          finalGroups.push({
            id: groupId,
            ...group
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