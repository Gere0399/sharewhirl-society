import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePostActions(currentUserId?: string) {
  const { toast } = useToast();

  const handleLike = async (postId: string, setPost: (post: any) => void) => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like posts",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if the user has already liked the post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (likeCheckError) {
        throw likeCheckError;
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);

        if (deleteError) throw deleteError;
      } else {
        // Like the post with timestamp
        const { error: insertError } = await supabase
          .from('likes')
          .insert([{ 
            post_id: postId, 
            user_id: currentUserId,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      // Fetch the latest post data after like/unlike
      const { data: updatedPost, error: fetchError } = await supabase
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

      if (fetchError) throw fetchError;

      if (updatedPost) {
        console.log('Post updated after like/unlike:', updatedPost);
        setPost(updatedPost);
      }

    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return { handleLike };
}