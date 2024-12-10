import { supabase } from "@/integrations/supabase/client";

export const trackPostView = async (postId: string, userId?: string) => {
  if (!userId) return;
  
  try {
    await supabase
      .from('post_views')
      .insert({ post_id: postId, user_id: userId })
      .select()
      .single();
  } catch (error: any) {
    // Ignore unique constraint violations (already viewed)
    if (error.code !== '23505') {
      console.error('Error tracking view:', error);
    }
  }
};