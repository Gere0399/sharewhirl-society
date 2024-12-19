import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePostSubscription(initialPost: any) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (!post?.id) return;

    // Subscribe to specific post changes
    const channel = supabase
      .channel(`post_${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${post.id}`
        },
        (payload) => {
          console.log('Post update received:', payload);
          if (payload.new) {
            setPost((prevPost: any) => ({
              ...prevPost,
              ...payload.new
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post?.id]);

  return { post, setPost };
}