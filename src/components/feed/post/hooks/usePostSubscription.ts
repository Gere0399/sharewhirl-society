import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function usePostSubscription(initialPost: any) {
  const [post, setPost] = useState(initialPost);

  const fetchLatestPostData = async (postId: string) => {
    const { data: updatedPost, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          username,
          avatar_url,
          created_at,
          bio
        ),
        likes (
          user_id,
          created_at
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      console.error('Error fetching updated post:', error);
      return null;
    }

    return updatedPost;
  };

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
        async (payload: any) => {
          console.log('Post updated:', payload);
          const updatedPost = await fetchLatestPostData(post.id);
          if (updatedPost) {
            setPost(updatedPost);
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
          console.log('Likes changed, fetching updated post data');
          const updatedPost = await fetchLatestPostData(post.id);
          if (updatedPost) {
            setPost(updatedPost);
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