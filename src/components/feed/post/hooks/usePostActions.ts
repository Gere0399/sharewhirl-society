import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePostActions(currentUserId?: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLike = async (postId: string, setPost?: (post: any) => void) => {
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
      console.log('Handling like for post:', postId);

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', currentUserId)
        .maybeSingle();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId);
        
        console.log('Like removed');
      } else {
        await supabase
          .from('likes')
          .insert([{ post_id: postId, user_id: currentUserId }]);
        
        console.log('Like added');
      }

      // If setPost function is provided, update the post state
      if (setPost) {
        setPost((prevPost: any) => ({
          ...prevPost,
          likes: existingLike 
            ? (prevPost.likes || []).filter((like: any) => like.user_id !== currentUserId)
            : [...(prevPost.likes || []), { user_id: currentUserId }],
          likes_count: Math.max(0, prevPost.likes_count + (existingLike ? -1 : 1))
        }));
      }
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleLike, isSubmitting };
}