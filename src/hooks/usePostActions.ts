import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function usePostActions() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleLike = async (postId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user?.id) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like posts",
          variant: "destructive",
        });
        return;
      }

      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', session.session.user.id)
        .single();

      if (existingLike) {
        // Optimistically update UI
        queryClient.setQueryData(['post', postId], (oldData: any) => ({
          ...oldData,
          likes_count: (oldData?.likes_count || 0) - 1,
          likes: oldData?.likes?.filter((like: any) => like.user_id !== session.session.user.id) || []
        }));

        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.session.user.id);
      } else {
        // Optimistically update UI
        queryClient.setQueryData(['post', postId], (oldData: any) => ({
          ...oldData,
          likes_count: (oldData?.likes_count || 0) + 1,
          likes: [...(oldData?.likes || []), { user_id: session.session.user.id }]
        }));

        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: session.session.user.id });
      }

      // No need to invalidate queries as we're using real-time updates
    } catch (error: any) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      
      // Invalidate queries to ensure correct state on error
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  };

  return { handleLike };
}