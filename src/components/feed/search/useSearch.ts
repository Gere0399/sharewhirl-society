import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MAX_RESULTS_PER_TYPE = 5;

export function useSearch(initialSearch: string = "") {
  const [search, setSearch] = useState(initialSearch);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      if (!search.trim()) return [];

      const [profilesResponse, postsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .ilike("username", `%${search}%`)
          .order('username')
          .limit(MAX_RESULTS_PER_TYPE),
        supabase
          .from("posts")
          .select(`
            id,
            title,
            content,
            media_url,
            media_type,
            created_at
          `)
          .or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
          .order('created_at', { ascending: false })
          .limit(MAX_RESULTS_PER_TYPE)
      ]);

      if (profilesResponse.error) throw profilesResponse.error;
      if (postsResponse.error) throw postsResponse.error;

      const profiles = (profilesResponse.data || []).map(profile => ({
        type: "profile" as const,
        id: profile.user_id,
        username: profile.username,
        avatar_url: profile.avatar_url
      }));

      const posts = (postsResponse.data || []).map(post => ({
        type: "post" as const,
        id: post.id,
        title: post.title,
        content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
        media_url: post.media_url,
        media_type: post.media_type,
        created_at: post.created_at
      }));

      return [...profiles, ...posts];
    },
    enabled: search.trim().length > 0,
    staleTime: 300,
    refetchOnWindowFocus: false
  });

  return {
    search,
    setSearch,
    searchResults,
    isLoading,
  };
}