import { supabase } from "@/integrations/supabase/client";

export const trackPostView = async (postId: string, userId?: string) => {
  if (!userId) return;
  
  try {
    console.log('Tracking view for post:', postId, 'by user:', userId);
    
    // First check if the view already exists
    const { data: existingView } = await supabase
      .from('post_views')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    // Only insert if the view doesn't exist
    if (!existingView) {
      const { error } = await supabase
        .from('post_views')
        .insert({ post_id: postId, user_id: userId })
        .select()
        .single();

      if (error) {
        console.error('Error tracking view:', error);
      }
    }
  } catch (error: any) {
    // Log any errors but don't throw them to avoid breaking the UI
    console.error('Error in trackPostView:', error);
  }
};