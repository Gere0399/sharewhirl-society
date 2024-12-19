import { PostStats } from "./PostStats";
import { PostActionButtons } from "./PostActionButtons";
import { ShareButton } from "./actions/ShareButton";
import { PostMenu } from "./menu/PostMenu";

interface PostActionsProps {
  postId: string;
  postTitle: string;
  content: string;
  tags: string[];
  isAiGenerated: boolean;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
  onLike: () => void;
  onCommentClick: () => void;
  onRepostClick: () => void;
  onDeleteClick?: () => void;
  isFullView?: boolean;
}

export function PostActions({
  postId,
  postTitle,
  content,
  tags,
  isAiGenerated,
  createdAt,
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
        onLike={onLike}
        onComment={onCommentClick}
        onRepost={onRepostClick}
      />

      <div className="ml-auto flex items-center gap-2">
        <ShareButton postId={postId} />
        <PostMenu
          postId={postId}
          postTitle={postTitle}
          content={content}
          tags={tags}
          isAiGenerated={isAiGenerated}
          createdAt={createdAt}
          isOwnPost={isOwnPost}
        />
      </div>
    </div>
  );
}