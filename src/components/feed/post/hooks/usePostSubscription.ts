import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePostSubscription(initialPost: any) {
  const [post, setPost] = useState(initialPost);

  useEffect(() => {
    if (!post?.id) return;

    console.log('Setting up real-time subscriptions for post:', post.id);

    // Subscribe to post changes (including likes_count and views_count)
    const postsChannel = supabase
      .channel(`post_${post.id}_posts`)
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

    // Subscribe to likes changes
    const likesChannel = supabase
      .channel(`post_${post.id}_likes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        async (payload) => {
          console.log('Likes update received:', payload);
          
          // Fetch updated likes data
          const { data: likes } = await supabase
            .from('likes')
            .select('user_id')
            .eq('post_id', post.id);

          setPost((prevPost: any) => ({
            ...prevPost,
            likes: likes || []
          }));
        }
      )
      .subscribe();

    // Subscribe to views changes
    const viewsChannel = supabase
      .channel(`post_${post.id}_views`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_views',
          filter: `post_id=eq.${post.id}`
        },
        (payload) => {
          console.log('Views update received:', payload);
          // The views_count will be updated through the posts subscription
          // since we have a trigger that updates it
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions for post:', post.id);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(viewsChannel);
    };
  }, [post?.id]);

  return { post, setPost };
}