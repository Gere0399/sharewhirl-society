import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type Post = Database['public']['Tables']['posts']['Row'] & {
  profiles?: Database['public']['Tables']['profiles']['Row'];
  likes?: { user_id: string }[];
};

interface PostPayloadNew {
  [key: string]: any;
  id: string;
}

type PostPayload = RealtimePostgresChangesPayload<PostPayloadNew>;

export function useFeedSubscription(posts: Post[]) {
  const [feedPosts, setFeedPosts] = useState(posts);

  useEffect(() => {
    // Set initial posts
    setFeedPosts(posts);
    
    if (posts.length === 0) return;
    
    // Subscribe to all posts changes in a single subscription
    const channel = supabase
      .channel('feed_posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=in.(${posts.map(p => p.id).join(',')})`,
        },
        (payload: PostPayload) => {
          console.log('Feed post update received:', payload);
          const newData = payload.new as PostPayloadNew;
          if (newData && typeof newData === 'object' && 'id' in newData) {
            setFeedPosts(currentPosts => 
              currentPosts.map(post => 
                post.id === newData.id 
                  ? { ...post, ...newData }
                  : post
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up feed subscription');
      supabase.removeChannel(channel);
    };
  }, [posts]);

  return { feedPosts, setFeedPosts };
}