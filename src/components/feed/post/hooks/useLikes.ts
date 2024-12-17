import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useLikes(currentUserId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // First check if the user has already liked the post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (likeCheckError && likeCheckError.code !== 'PGRST116') {
        throw likeCheckError;
      }

      // Optimistic update
      setPost((prevPost: any) => {
        const isLiked = existingLike !== null;
        const currentLikes = prevPost.likes || [];
        
        return {
          ...prevPost,
          likes_count: prevPost.likes_count + (isLiked ? -1 : 1),
          likes: isLiked
            ? currentLikes.filter((like: any) => like.user_id !== currentUserId)
            : [...currentLikes, { user_id: currentUserId }]
        };
      });

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: currentUserId }]);
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleLike, isSubmitting };
}