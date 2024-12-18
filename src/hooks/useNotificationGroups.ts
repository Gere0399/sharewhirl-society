import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationGroups = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["notification-groups", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No user ID found");
        return [];
      }

      console.log("Fetching notifications for user:", userId);

      const { data: groups, error: groupsError } = await supabase
        .from("notification_groups")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (groupsError) {
        console.error("Error fetching groups:", groupsError);
        throw groupsError;
      }

      return groups || [];
    },
    enabled: !!userId,
  });
};