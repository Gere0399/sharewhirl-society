import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface PostHeaderProps {
  profile: any;
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername }: PostHeaderProps) {
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
    <div className="flex flex-row items-center gap-4 px-0">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link to={`/profile/${profile?.username}`} className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
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
            <p className="text-sm text-muted-foreground">{profile?.bio}</p>
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