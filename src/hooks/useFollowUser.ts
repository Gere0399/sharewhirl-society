import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFollowUser = (profileUserId: string | undefined, currentUserId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!currentUserId || !profileUserId) return;

    console.log("Checking follow status for:", { profileUserId, currentUserId });

    const checkFollowStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('follows')
          .select()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileUserId)
          .maybeSingle();

        if (error) throw error;
        setIsFollowing(!!data);

        // Get followers count
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('followers_count')
          .eq('user_id', profileUserId)
          .single();

        if (profileError) throw profileError;
        setFollowersCount(profileData.followers_count || 0);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [profileUserId, currentUserId]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    if (!profileUserId) {
      toast({
        title: "Error",
        description: "Unable to follow user at this time",
        variant: "destructive",
      });
      return;
    }

    console.log("Handling follow action:", { profileUserId, currentUserId, isFollowing });

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileUserId);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profileUserId
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Follow action error:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  return { isFollowing, followersCount, handleFollow };
};