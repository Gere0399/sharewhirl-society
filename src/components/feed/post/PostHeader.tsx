import { ProfileHoverCard } from "./header/ProfileHoverCard";
import { PostHeaderInfo } from "./header/PostHeaderInfo";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    created_at: string;
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
        <div className="flex items-center gap-2 flex-wrap justify-between">
          <PostHeaderInfo 
            username={profile.username}
            created_at={profile.created_at}
            has_subscription={profile.has_subscription}
          />
          {isAiGenerated && (
            <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground">
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