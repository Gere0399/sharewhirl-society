import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { formatTimeAgo } from "@/utils/dateUtils";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    created_at: string;
  };
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername }: PostHeaderProps) {
  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex items-start gap-2">
      <Link to={`/profile/${profile.username}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={profile.avatar_url} alt={profile.username} />
          <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${profile.username}`}
            className="font-medium hover:underline truncate"
          >
            {profile.username}
          </Link>
          {isAiGenerated && (
            <Sparkles className="h-4 w-4 text-primary" />
          )}
          <span className="text-muted-foreground text-sm">
            {formatTimeAgo(profile.created_at)}
          </span>
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