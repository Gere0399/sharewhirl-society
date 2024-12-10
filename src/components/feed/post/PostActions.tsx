import { PostStats } from "./PostStats";
import { PostActionButtons } from "./PostActionButtons";
import { ShareButton } from "./actions/ShareButton";
import { PostMenu } from "./menu/PostMenu";

interface PostActionsProps {
  postId: string;
  postTitle: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
  onLike: (postId: string) => void;
  onCommentClick: () => void;
  onRepostClick: () => void;
  onDeleteClick?: () => void;
  isFullView?: boolean;
}

export function PostActions({
  postId,
  postTitle,
  likesCount,
  commentsCount,
  viewsCount = 0,
  repostCount = 0,
  isLiked,
  isOwnPost,
  onLike,
  onCommentClick,
  onRepostClick,
  onDeleteClick,
  isFullView = false,
}: PostActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <PostStats viewsCount={viewsCount} />
      
      <PostActionButtons
        likesCount={likesCount}
        commentsCount={commentsCount}
        repostCount={repostCount}
        isLiked={isLiked}
        onLike={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onLike(postId);
        }}
        onComment={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onCommentClick();
        }}
        onRepost={(e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onRepostClick();
        }}
      />

      <div className="ml-auto flex items-center gap-2">
        <ShareButton postId={postId} />
        <PostMenu
          postId={postId}
          postTitle={postTitle}
          isOwnPost={isOwnPost}
          onDeleteClick={onDeleteClick}
        />
      </div>
    </div>
  );
}