import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePostSubscription(initialPost: any) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (!post?.id) return;

    // Subscribe to post updates
    const postChannel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${post.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setPost((prevPost: any) => ({
              ...prevPost,
              ...payload.new,
              // Preserve nested data that isn't included in the payload
              profiles: prevPost.profiles,
              likes: prevPost.likes
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to likes updates
    const likesChannel = supabase
      .channel(`likes-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          const { data } = await supabase
            .from('posts')
            .select(`
              likes_count,
              likes (
                user_id
              )
            `)
            .eq('id', post.id)
            .single();

          if (data) {
            setPost((prevPost: any) => ({
              ...prevPost,
              likes_count: data.likes_count,
              likes: data.likes
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [post?.id]);

  return { post, setPost };
}