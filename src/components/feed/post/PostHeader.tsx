import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    created_at: string;
    bio?: string;
    followers_count?: number;
    user_id: string;
  };
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername }: PostHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followers_count || 0);
  const { toast } = useToast();

  useEffect(() => {
    const checkFollowStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('follows')
        .select()
        .eq('follower_id', user.id)
        .eq('following_id', profile.user_id)
        .single();

      setIsFollowing(!!data);
    };

    checkFollowStatus();

    // Subscribe to follows changes
    const channel = supabase
      .channel(`public:profiles:user_id=eq.${profile.user_id}`)
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
  }, [profile.user_id]);

  const handleFollow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id);
        setIsFollowing(false);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
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
    <div className="flex items-start gap-2">
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
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Link
                to={`/profile/${profile.username}`}
                className="font-medium hover:underline truncate"
              >
                {profile.username}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={profile.avatar_url} />
                  <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Follow
                </Button>
              </div>
              <div className="space-y-1 mt-3">
                <h4 className="text-sm font-semibold">@{profile.username}</h4>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground">
                    {profile.bio}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  {profile.followers_count || 0} followers
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
          <div className="flex items-center gap-2 ml-auto">
            {isAiGenerated && (
              <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground">
                AI generated
              </span>
            )}
            <span className="text-muted-foreground text-sm">
              {formatTimeAgo(profile.created_at)}
            </span>
          </div>
        </div>
        {repostedFromUsername && (
          <div className="text-sm text-muted-foreground">
            Reposted from{" "}
            <Link
              to={`/profile/${repostedFromUsername}`}
              className="hover:underline"
            >
              @{repostedFromUsername}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}