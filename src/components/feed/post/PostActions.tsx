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
  onRepostClick: () => void;
  isFullView?: boolean;
}

export function PostActions({ 
  postId, 
  likesCount, 
  commentsCount, 
  isLiked,
  onLike,
  onCommentClick,
  onRepostClick,
  isFullView
}: PostActionsProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const origin = window.location.origin;
      const url = `${origin}/post/${postId}`;
      await navigator.clipboard.writeText(url);
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

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onLike(postId);
    } catch (error) {
      console.error("Error liking post:", error);
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
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
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRepostClick}
      >
        <Flag className="w-4 h-4 mr-1" />
        Repost
      </Button>
      
      <Button variant="ghost" size="sm" onClick={handleShare}>
        <Share2 className="w-4 h-4 mr-1" />
        Copy Link
      </Button>
    </div>
  );
}