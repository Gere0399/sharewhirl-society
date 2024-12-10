import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PostHeaderProps {
  profile: any;
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername }: PostHeaderProps) {
  const [followersCount, setFollowersCount] = useState(profile?.followers_count || 0);

  useEffect(() => {
    // Subscribe to follows changes
    const channel = supabase.channel('follows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${profile?.user_id}`,
        },
        (payload) => {
          console.log('PostHeader - Follows change received:', payload);
          if (payload.eventType === 'INSERT') {
            console.log('PostHeader - Follow added, updating count from', followersCount, 'to', followersCount + 1);
            setFollowersCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            console.log('PostHeader - Follow removed, updating count from', followersCount, 'to', followersCount - 1);
            setFollowersCount(prev => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.user_id]);

  const getTimeDisplay = (date: string) => {
    const postDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours <= 24) {
      return formatDistanceToNow(postDate, { addSuffix: true });
    }
    return new Date(profile?.created_at).toLocaleDateString();
  };

  return (
    <div className="flex flex-row items-start gap-4 px-0">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link to={`/profile/${profile?.username}`} className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{profile?.username}</span>
              <span className="text-sm text-muted-foreground">
                {getTimeDisplay(profile?.created_at)}
              </span>
            </div>
          </Link>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex flex-col gap-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <h4 className="text-lg font-semibold">{profile?.username}</h4>
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">{profile?.bio}</p>
              <p>{followersCount} followers</p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      {isAiGenerated && (
        <Badge variant="secondary" className="ml-auto">
          AI Generated
        </Badge>
      )}
      
      {repostedFromUsername && (
        <Badge variant="outline" className="ml-auto">
          Reposted from @{repostedFromUsername}
        </Badge>
      )}
    </div>
  );
}