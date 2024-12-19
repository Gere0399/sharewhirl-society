import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { supabase } from "@/integrations/supabase/client";

export function useViewTracking(postId?: string, currentUserId?: string) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!postId || !currentUserId || !inView) return;

    const trackView = async () => {
      try {
        console.log('Tracking view for post:', postId);
        
        // Check if view already exists
        const { data: existingView } = await supabase
          .from('post_views')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (!existingView) {
          await supabase
            .from('post_views')
            .insert({ post_id: postId, user_id: currentUserId });
          
          console.log('View tracked successfully');
        } else {
          console.log('View already tracked');
        }
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [postId, currentUserId, inView]);

  return { ref };
}