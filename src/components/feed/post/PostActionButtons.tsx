import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat } from "lucide-react";

interface PostActionButtonsProps {
  likesCount: number;
  commentsCount: number;
  repostCount: number;
  isLiked?: boolean;
  onLike: () => void;
  onComment: () => void;
  onRepost: () => void;
}

export function PostActionButtons({
  likesCount,
  commentsCount,
  repostCount,
  isLiked,
  onLike,
  onComment,
  onRepost,
}: PostActionButtonsProps) {
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike();
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onComment();
  };

  const handleRepostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRepost();
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={`group px-2 hover:bg-red-500/10 ${isLiked ? 'text-red-500' : ''}`}
        onClick={handleLikeClick}
      >
        <Heart
          className={`mr-1 h-4 w-4 transition-all ${
            isLiked ? "fill-red-500 text-red-500" : "group-hover:text-red-500"
          }`}
        />
        <span className={`text-sm ${isLiked ? 'text-red-500' : ''}`}>{likesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group px-2"
        onClick={handleCommentClick}
      >
        <MessageCircle className="mr-1 h-4 w-4" />
        <span className="text-sm">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group px-2"
        onClick={handleRepostClick}
      >
        <Repeat className="mr-1 h-4 w-4" />
        <span className="text-sm">{repostCount}</span>
      </Button>
    </div>
  );
}