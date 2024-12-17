import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ProfileHoverCard } from "./ProfileHoverCard";
import { PostMenu } from "../menu/PostMenu";

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
}

export function PostHeader({ 
  profile,
  currentUserId,
  isAiGenerated,
  repostedFromUsername,
  createdAt
}: PostHeaderProps) {
  if (!profile) return null;

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
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
      {currentUserId === profile.user_id && (
        <PostMenu postId={profile.user_id} />
      )}
    </div>
  );
}