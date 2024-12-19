import { supabase } from "@/integrations/supabase/client";

export const trackPostView = async (postId: string, userId?: string) => {
  if (!userId) return;
  
  try {
    // First check if the view already exists
    const { data: existingView } = await supabase
      .from('post_views')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();

    // Only insert if the view doesn't exist
    if (!existingView) {
      await supabase
        .from('post_views')
        .insert({ post_id: postId, user_id: userId })
        .select()
        .single();
    }
  } catch (error: any) {
    console.error('Error in trackPostView:', error);
  }
};