import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProfileData = (username: string | undefined) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("Profile not found");
      
      return data;
    },
    enabled: !!username,
  });
};

export const useProfilePosts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profilePosts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!inner (
            username,
            avatar_url
          ),
          likes (
            user_id
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};