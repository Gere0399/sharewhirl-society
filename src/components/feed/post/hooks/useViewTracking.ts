import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useViewTracking(postId?: string, currentUserId?: string) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!postId || !currentUserId || hasTrackedRef.current) return;

    const trackView = async () => {
      try {
        await supabase
          .from('post_views')
          .insert({ post_id: postId, user_id: currentUserId })
          .throwOnError();
          
        hasTrackedRef.current = true;
      } catch (error: any) {
        // Ignore duplicate key violations (409 errors)
        if (!error.message?.includes('duplicate key')) {
          console.error('Error tracking view:', error);
        }
      }
    };

    trackView();
  }, [postId, currentUserId]);
}