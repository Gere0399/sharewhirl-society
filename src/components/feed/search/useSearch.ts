import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/use-debounce';

interface SearchResult {
  type: 'profile' | 'post';
  id: string;
  user_id?: string;
  username?: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  title?: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  created_at?: string;
  tags?: string[];
}

export function useSearch(initialSearch: string = '') {
  const [search, setSearch] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);

      try {
        const [profilesResponse, postsResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('user_id, username, avatar_url, bio, followers_count')
            .ilike('username', `%${debouncedSearch}%`)
            .limit(10),
          supabase
            .from('posts')
            .select('id, title, content, media_url, media_type, created_at, tags')
            .or(`title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`)
            .limit(10)
        ]);

        const profiles = (profilesResponse.data || []).map(profile => ({
          type: 'profile' as const,
          id: profile.user_id,
          user_id: profile.user_id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          followers_count: profile.followers_count
        }));

        const posts = (postsResponse.data || []).map(post => ({
          type: 'post' as const,
          id: post.id,
          title: post.title,
          content: post.content,
          media_url: post.media_url,
          media_type: post.media_type,
          created_at: post.created_at,
          tags: post.tags
        }));

        setSearchResults([...profiles, ...posts]);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  return {
    search,
    setSearch,
    searchResults,
    isLoading
  };
}