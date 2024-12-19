import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useViewTracking(postId: string, currentUserId?: string) {
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    if (!postId || !currentUserId || hasTrackedView) return;

    const trackView = async () => {
      try {
        // First check if view already exists
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
        }
        
        setHasTrackedView(true);
      } catch (error) {
        // Ignore 409 Conflict errors as they indicate the view was already tracked
        if (!(error as any)?.message?.includes('409')) {
          console.error('Error tracking view:', error);
        }
      }
    };

    trackView();
  }, [postId, currentUserId, hasTrackedView]);

  return { hasTrackedView };
}