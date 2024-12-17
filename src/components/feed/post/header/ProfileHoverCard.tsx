import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

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
    if (!currentUserId) return;

    const checkFollowStatus = async () => {
      const { data } = await supabase
        .from('follows')
        .select()
        .eq('follower_id', currentUserId)
        .eq('following_id', profile.user_id)
        .single();

      setIsFollowing(!!data);
    };

    checkFollowStatus();

    // Subscribe to follows changes
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
          if (payload.new) {
            setFollowersCount(payload.new.followers_count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.user_id, currentUserId]);

  const handleFollow = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq('follower_id', currentUserId)
          .eq('following_id', profile.user_id);
        setIsFollowing(false);
      } else {
        await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: profile.user_id
          });
        setIsFollowing(true);
      }
    } catch (error: any) {
      console.error('Follow error:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      });
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={`/profile/${profile.username}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile.avatar_url} alt={profile.username} />
            <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
          </Avatar>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
          </Avatar>
          {currentUserId && currentUserId !== profile.user_id && (
            <Button 
              variant={isFollowing ? "secondary" : "default"}
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                handleFollow();
              }}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
        <div className="space-y-1 mt-3">
          <h4 className="text-sm font-semibold">@{profile.username}</h4>
          {profile.bio && (
            <p className="text-sm text-muted-foreground">
              {profile.bio}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {followersCount} followers
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}