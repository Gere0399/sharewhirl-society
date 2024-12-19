import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "react-intersection-observer";

export function useViewTracking(postId?: string, currentUserId?: string) {
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (!postId || !currentUserId || !inView || hasTrackedView) return;

    const trackView = async () => {
      try {
        // First check if view already exists to prevent duplicate tracking
        const { data: existingView } = await supabase
          .from('post_views')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
          .maybeSingle();

        if (!existingView) {
          await supabase
            .from('post_views')
            .insert({ post_id: postId, user_id: currentUserId })
            .select()
            .single();
          
          console.log('View tracked for post:', postId);
        }
        
        setHasTrackedView(true);
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [postId, currentUserId, inView, hasTrackedView]);

  return { ref, hasTrackedView };
}