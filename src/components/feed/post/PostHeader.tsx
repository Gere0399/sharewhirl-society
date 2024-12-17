import { Link } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { ProfileHoverCard } from "./header/ProfileHoverCard";
import { PostMenu } from "./menu/PostMenu";

interface PostHeaderProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
  };
  currentUserId?: string;
  isAiGenerated?: boolean;
  repostedFromUsername?: string;
  createdAt: string;
  postId: string;
  postTitle: string;
  content: string;
  tags: string[];
}

export function PostHeader({ 
  profile,
  currentUserId,
  isAiGenerated,
  repostedFromUsername,
  createdAt,
  postId,
  postTitle,
  content,
  tags
}: PostHeaderProps) {
  if (!profile) return null;

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-start gap-2 flex-grow min-w-0">
        <ProfileHoverCard profile={profile} currentUserId={currentUserId} showAvatar={true} />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <ProfileHoverCard profile={profile} currentUserId={currentUserId} showAvatar={false} />
            <span className="text-muted-foreground text-sm">·</span>
            <span className="text-muted-foreground text-sm">
              {formatTimeAgo(createdAt)}
            </span>
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
                onClick={(e) => e.stopPropagation()}
              >
                @{repostedFromUsername}
              </Link>
            </div>
          )}
        </div>
      </div>
      {currentUserId === profile.user_id && (
        <PostMenu 
          postId={postId}
          postTitle={postTitle}
          content={content}
          tags={tags}
          isAiGenerated={isAiGenerated || false}
          createdAt={createdAt}
          isOwnPost={true}
        />
      )}
    </div>
  );
}