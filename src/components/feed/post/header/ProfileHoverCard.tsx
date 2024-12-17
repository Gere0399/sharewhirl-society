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
    if (!currentUserId || !profile.user_id) return;

    const checkFollowStatus = async () => {
      try {
        console.log('Checking follow status for:', {
          follower: currentUserId,
          following: profile.user_id
        });

        const { data, error } = await supabase
          .from('follows')
          .select()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.user_id)
          .maybeSingle();

        if (error) throw error;
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
          if (payload.new?.followers_count !== undefined) {
            setFollowersCount(payload.new.followers_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.user_id, currentUserId]);

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

    if (!profile.user_id) {
      console.error('Missing profile user_id:', profile);
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
      action: isFollowing ? 'unfollow' : 'follow'
    });

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.user_id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profile.user_id
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