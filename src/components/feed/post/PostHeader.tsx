import { Link } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { ProfileHoverCard } from "./header/ProfileHoverCard";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
    created_at: string;
  };
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
  createdAt: string;
}

export function PostHeader({ profile, isAiGenerated, repostedFromUsername, createdAt }: PostHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      <ProfileHoverCard profile={profile} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            to={`/profile/${profile.username}`}
            className="font-medium hover:underline truncate"
          >
            {profile.username}
          </Link>
          <span className="text-muted-foreground text-sm">·</span>
          <span className="text-muted-foreground text-sm">
            {formatTimeAgo(createdAt)}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            {isAiGenerated && (
              <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground">
                AI generated
              </span>
            )}
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