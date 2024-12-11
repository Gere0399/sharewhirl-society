import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEBOUNCE_DELAY = 300;
const MAX_RESULTS_PER_TYPE = 5;

export function useSearch(initialSearch: string = "") {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];

      const [profilesResponse, postsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .ilike("username", `%${debouncedSearch}%`)
          .order('username')
          .limit(MAX_RESULTS_PER_TYPE),
        supabase
          .from("posts")
          .select("id, title, content, media_url, media_type, created_at")
          .or(`title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`)
          .order('created_at', { ascending: false })
          .limit(MAX_RESULTS_PER_TYPE)
      ]);

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
    enabled: debouncedSearch.length > 0
  });

  return {
    search,
    setSearch,
    searchResults,
    isLoading,
  };
}