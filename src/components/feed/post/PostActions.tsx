import { Heart, MessageSquare, Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLike: (postId: string) => void;
  onCommentClick: () => void;
}

export function PostActions({ 
  postId, 
  likesCount, 
  commentsCount, 
  isLiked,
  onLike,
  onCommentClick
}: PostActionsProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${postId}`
      );
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onLike(postId)}
        className={isLiked ? "text-red-500" : ""}
      >
        <Heart className="w-4 h-4 mr-1" />
        {likesCount || 0}
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onCommentClick}
      >
        <MessageSquare className="w-4 h-4 mr-1" />
        {commentsCount || 0}
      </Button>
      
      <Button variant="ghost" size="sm">
        <Flag className="w-4 h-4 mr-1" />
        Repost
      </Button>
      
      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-1" />
        Share
      </Button>
    </div>
  );
}