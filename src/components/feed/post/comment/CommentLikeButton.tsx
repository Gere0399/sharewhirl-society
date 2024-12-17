import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentLikeButtonProps {
  isLiked: boolean;
  likesCount: number;
  onLike: () => void;
}

export function CommentLikeButton({ isLiked, likesCount, onLike }: CommentLikeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`h-8 px-2 ${isLiked ? 'text-red-500' : ''}`}
      onClick={onLike}
    >
      <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
      {likesCount}
    </Button>
  );
}