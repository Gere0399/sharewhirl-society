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
      
      console.log("Fetched profile data:", data);
      return data;
    },
    enabled: !!username,
  });
};

export const useProfilePosts = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profilePosts", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No userId provided to useProfilePosts");
        throw new Error("User ID is required");
      }
      
      console.log("Fetching posts for userId:", userId);
      
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            avatar_url,
            created_at,
            bio
          ),
          likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching profile posts:", error);
        throw error;
      }

      console.log("Raw posts data:", data);

      // Add likes_count and format the data
      const formattedPosts = data?.map(post => ({
        ...post,
        likes_count: post.likes?.length || 0,
        comments_count: post.comments?.length || 0
      })) || [];

      console.log("Formatted profile posts:", formattedPosts);
      return formattedPosts;
    },
    enabled: !!userId,
  });
};