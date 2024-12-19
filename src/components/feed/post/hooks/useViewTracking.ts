import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useViewTracking(postId?: string, currentUserId?: string) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!postId || !currentUserId || hasTrackedRef.current) return;

    const trackView = async () => {
      try {
        // First check if the view already exists
        const { data: existingView } = await supabase
          .from('post_views')
          .select('*')
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
          .maybeSingle();

        // Only insert if the view doesn't exist
        if (!existingView) {
          await supabase
            .from('post_views')
            .insert({ post_id: postId, user_id: currentUserId })
            .throwOnError();
        }
          
        hasTrackedRef.current = true;
      } catch (error: any) {
        // Only log errors that aren't related to conflicts
        if (!error.message?.includes('duplicate key')) {
          console.error('Error tracking view:', error);
        }
      }
    };

    trackView();
  }, [postId, currentUserId]);
}