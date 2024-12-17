import { Link } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { ProfileHoverCard } from "./ProfileHoverCard";
import { BadgeCheck } from "lucide-react";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    created_at: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
    has_subscription?: boolean;
  };
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername }: PostHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      <ProfileHoverCard profile={profile} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Link
              to={`/profile/${profile.username}`}
              className="font-medium hover:underline truncate"
            >
              {profile.username}
            </Link>
            {profile.has_subscription && (
              <BadgeCheck className="h-4 w-4 text-primary fill-primary" />
            )}
            <span className="text-muted-foreground text-sm">
              · {formatTimeAgo(profile.created_at)}
            </span>
          </div>
          {isAiGenerated && (
            <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground ml-auto">
              AI generated
            </span>
          )}
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