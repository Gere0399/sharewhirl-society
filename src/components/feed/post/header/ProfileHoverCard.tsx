import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ProfileHoverCardContent } from "./ProfileHoverCardContent";
import { getInitials } from "@/utils/stringUtils";

interface ProfileHoverCardProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
  };
  currentUserId?: string;
}

export function ProfileHoverCard({ profile, currentUserId }: ProfileHoverCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followers_count || 0);
  const { toast } = useToast();

  useEffect(() => {
    // Log initial props
    console.log('ProfileHoverCard mounted with:', { profile, currentUserId });
    
    if (!currentUserId) {
      console.log('No currentUserId provided');
      return;
    }
    
    if (!profile?.user_id) {
      console.error('Profile or profile.user_id is missing:', profile);
      return;
    }

    const checkFollowStatus = async () => {
      try {
        console.log('Checking follow status for:', {
          follower: currentUserId,
          following: profile.user_id,
          profile
        });

        const { data, error } = await supabase
          .from('follows')
          .select()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.user_id)
          .maybeSingle();

        if (error) {
          console.error('Supabase error in checkFollowStatus:', error);
          throw error;
        }

        console.log('Follow status result:', data);
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();

    const channel = supabase
      .channel(`profile-${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${profile.user_id}`
        },
        (payload: any) => {
          console.log('Profile update received:', payload);
          if (payload.new?.followers_count !== undefined) {
            setFollowersCount(payload.new.followers_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.user_id, currentUserId, profile]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate currentUserId
    if (!currentUserId) {
      console.log('No currentUserId provided in handleFollow');
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    // Validate profile and profile.user_id
    if (!profile?.user_id) {
      console.error('Profile or profile.user_id is missing in handleFollow:', { profile });
      toast({
        title: "Error",
        description: "Unable to follow user at this time",
        variant: "destructive",
      });
      return;
    }

    console.log('Follow action initiated:', {
      follower: currentUserId,
      following: profile.user_id,
      action: isFollowing ? 'unfollow' : 'follow',
      profile
    });

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.user_id);

        if (error) {
          console.error('Unfollow error:', error);
          throw error;
        }
        
        console.log('Successfully unfollowed');
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profile.user_id
          });

        if (error) {
          console.error('Follow error:', error);
          throw error;
        }
        
        console.log('Successfully followed');
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

  // Log render props
  console.log('ProfileHoverCard rendering with:', { 
    profile, 
    currentUserId, 
    isFollowing, 
    followersCount 
  });

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link 
          to={`/profile/${profile.username}`}
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
            <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
          </Avatar>
        </Link>
      </HoverCardTrigger>
      
      <HoverCardContent className="w-80" onClick={(e) => e.stopPropagation()}>
        <ProfileHoverCardContent 
          profile={profile}
          currentUserId={currentUserId}
          isFollowing={isFollowing}
          followersCount={followersCount}
          onFollow={handleFollow}
        />
      </HoverCardContent>
    </HoverCard>
  );
}