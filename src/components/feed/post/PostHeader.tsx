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
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (profile?.followers_count !== undefined) {
      setFollowersCount(profile.followers_count);
    }

    if (!profile?.user_id) return;

    const channel = supabase.channel(`follows_changes_${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${profile.user_id}`,
        },
        (payload) => {
          console.log('PostHeader - Follows change received:', payload);
          if (payload.eventType === 'INSERT') {
            setFollowersCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setFollowersCount(prev => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile?.user_id, profile?.followers_count]);

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
    <div className="flex flex-row items-start gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link to={`/profile/${profile?.username}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="font-semibold">{profile?.username}</span>
              <span className="text-xs text-muted-foreground">
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
      
      <div className="ml-auto flex items-center gap-2">
        {isAiGenerated && (
          <Badge variant="secondary">
            AI Generated
          </Badge>
        )}
        
        {repostedFromUsername && (
          <Badge variant="outline">
            Reposted from @{repostedFromUsername}
          </Badge>
        )}
      </div>
    </div>
  );
}