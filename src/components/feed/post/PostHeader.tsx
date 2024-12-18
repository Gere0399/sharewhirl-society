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
  };
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
  createdAt: string;
  currentUserId?: string;
}

export function PostHeader({ 
  profile, 
  isAiGenerated, 
  repostedFromUsername, 
  createdAt, 
  currentUserId
}: PostHeaderProps) {
  if (!profile) return null;

  return (
    <div className="flex justify-between items-start w-full">
      <div className="flex gap-3">
        <div className="shrink-0">
          <ProfileHoverCard 
            profile={profile} 
            currentUserId={currentUserId} 
            showAvatar={true} 
          />
        </div>
        <div className="flex flex-col justify-between py-1 h-12">
          <div className="flex items-center gap-2">
            <ProfileHoverCard 
              profile={profile} 
              currentUserId={currentUserId} 
              showAvatar={false} 
            />
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
          {repostedFromUsername && (
            <div className="text-sm text-muted-foreground">
              Reposted from{" "}
              <Link
                to={`/profile/${repostedFromUsername}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                @{repostedFromUsername}
              </Link>
            </div>
          )}
        </div>
      </div>
      {isAiGenerated && (
        <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground">
          AI generated
        </span>
      )}
    </div>
  );
}