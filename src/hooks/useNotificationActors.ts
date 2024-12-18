import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export const useNotificationActors = (
  notification: Tables<"notifications">,
  enabled: boolean
) => {
  return useQuery({
    queryKey: ["notification-actors", notification.type, notification.post_id],
    queryFn: async () => {
      try {
        const query = supabase
          .from("notifications")
          .select(`
            actor:actor_id (
              id,
              user_id,
              username,
              avatar_url,
              bio,
              followers_count,
              created_at,
              updated_at,
              full_name,
              has_subscription
            )
          `)
          .eq("type", notification.type)
          .eq("user_id", notification.user_id)
          .order("created_at", { ascending: false });

        if (notification.type !== "follow" && notification.post_id) {
          query.eq("post_id", notification.post_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data?.map(n => n.actor) || [];
      } catch (error) {
        console.error("Error fetching notification actors:", error);
        return [];
      }
    },
    enabled: enabled && !!notification.type && !!notification.user_id
  });
};