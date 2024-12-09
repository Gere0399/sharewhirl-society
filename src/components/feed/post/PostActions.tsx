import { Heart, MessageSquare, Share2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleShare = async () => {
    if (isFullView) {
      try {
        await navigator.clipboard.writeText(window.location.href);
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
    } else {
      navigate(`/post/${postId}`);
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
        {isFullView ? 'Copy Link' : 'Share'}
      </Button>
    </div>
  );
}