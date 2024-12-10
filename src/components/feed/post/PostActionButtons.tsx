import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat } from "lucide-react";

interface PostActionButtonsProps {
  likesCount: number;
  commentsCount: number;
  repostCount: number;
  isLiked?: boolean;
  onLike: (e: React.MouseEvent) => void;
  onComment: (e: React.MouseEvent) => void;
  onRepost: (e: React.MouseEvent) => void;
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
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className="group px-2"
        onClick={onLike}
      >
        <Heart
          className={`mr-1 h-4 w-4 ${
            isLiked ? "fill-current text-red-500" : ""
          }`}
        />
        <span className="text-sm">{likesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group px-2"
        onClick={onComment}
      >
        <MessageCircle className="mr-1 h-4 w-4" />
        <span className="text-sm">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group px-2"
        onClick={onRepost}
      >
        <Repeat className="mr-1 h-4 w-4" />
        <span className="text-sm">{repostCount}</span>
      </Button>
    </div>
  );
}