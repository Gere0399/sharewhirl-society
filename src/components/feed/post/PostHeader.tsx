import { Link } from "react-router-dom";
import { formatTimeAgo } from "@/utils/dateUtils";
import { ProfileHoverCard } from "./header/ProfileHoverCard";
import { ShareButton } from "./actions/ShareButton";
import { PostMenu } from "./menu/PostMenu";

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
  postId: string;
  postTitle: string;
  content: string;
  tags: string[];
}

export function PostHeader({ 
  profile, 
  isAiGenerated, 
  repostedFromUsername, 
  createdAt, 
  currentUserId,
  postId,
  postTitle,
  content,
  tags
}: PostHeaderProps) {
  if (!profile) return null;

  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        <ProfileHoverCard 
          profile={profile} 
          currentUserId={currentUserId} 
          showAvatar={true} 
        />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
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
            {isAiGenerated && (
              <span className="text-xs bg-primary px-1.5 py-0.5 rounded text-primary-foreground">
                AI generated
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ShareButton postId={postId} />
            <PostMenu
              postId={postId}
              postTitle={postTitle}
              content={content}
              tags={tags}
              isAiGenerated={isAiGenerated}
              createdAt={createdAt}
              isOwnPost={currentUserId === profile.user_id}
            />
          </div>
        </div>
        {repostedFromUsername && (
          <div className="text-sm text-muted-foreground mt-1">
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
  );
}