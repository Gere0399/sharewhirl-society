import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ProfileHoverCard } from "./ProfileHoverCard";
import { PostMenu } from "../menu/PostMenu";

interface PostHeaderProps {
  post: {
    id: string;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string;
      avatar_url?: string;
      bio?: string;
      user_id: string;
      followers_count?: number;
    };
  };
  currentUserId?: string;
  onPostDeleted?: () => void;
}

export function PostHeader({ post, currentUserId, onPostDeleted }: PostHeaderProps) {
  if (!post.profiles) return null;

  const profile = {
    ...post.profiles,
    user_id: post.user_id // Ensure user_id is always present
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <ProfileHoverCard profile={profile} currentUserId={currentUserId} />
        <div className="flex flex-col">
          <Link
            to={`/profile/${profile.username}`}
            className="font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {profile.username}
          </Link>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
      {currentUserId === post.user_id && (
        <PostMenu postId={post.id} onPostDeleted={onPostDeleted} />
      )}
    </div>
  );
}