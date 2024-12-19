import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export const useFollowUser = (profileUserId: string | undefined, currentUserId: string | undefined) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();

  // Use React Query to cache the followers count
  const { data: followData } = useQuery({
    queryKey: ['profile-follow', profileUserId],
    queryFn: async () => {
      if (!profileUserId) return null;
      
      const [followStatus, profileData] = await Promise.all([
        currentUserId ? supabase
          .from('follows')
          .select()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileUserId)
          .maybeSingle() : null,
        supabase
          .from('profiles')
          .select('followers_count')
          .eq('user_id', profileUserId)
          .single()
      ]);

      return {
        isFollowing: !!followStatus?.data,
        followersCount: profileData.data?.followers_count || 0
      };
    },
    enabled: !!profileUserId,
    staleTime: 30000, // Cache for 30 seconds
    cacheTime: 60000, // Keep in cache for 1 minute
  });

  useEffect(() => {
    if (followData) {
      setIsFollowing(followData.isFollowing);
    }
  }, [followData]);

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

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profileUserId);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profileUserId
          });

        if (error) throw error;
        setIsFollowing(true);
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

  return { 
    isFollowing, 
    followersCount: followData?.followersCount || 0, 
    handleFollow 
  };
};