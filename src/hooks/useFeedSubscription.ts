import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useFeedSubscription(posts: any[]) {
  const [feedPosts, setFeedPosts] = useState(posts);

  useEffect(() => {
    // Set initial posts
    setFeedPosts(posts);
    
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
        (payload) => {
          console.log('Feed post update received:', payload);
          if (payload.new) {
            setFeedPosts(currentPosts => 
              currentPosts.map(post => 
                post.id === payload.new.id 
                  ? { ...post, ...payload.new }
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