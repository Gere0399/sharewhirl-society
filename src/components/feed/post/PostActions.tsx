import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  MessageCircle,
  Share2,
  Link as LinkIcon,
  Eye,
  Repeat
} from "lucide-react";

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  onLike: (postId: string) => void;
  onCommentClick: () => void;
  onRepostClick: () => void;
  isFullView?: boolean;
}

export function PostActions({
  postId,
  likesCount,
  commentsCount,
  viewsCount = 0,
  repostCount = 0,
  isLiked,
  onLike,
  onCommentClick,
  onRepostClick,
  isFullView = false,
}: PostActionsProps) {
  const { toast } = useToast();

  const handleLike = () => {
    onLike(postId);
  };

  const handleCopyLink = async () => {
    try {
      // Get the base URL from window.location.origin
      const baseUrl = window.location.origin;
      const postUrl = `${baseUrl}/post/${postId}`;
      
      console.log('Copy link debug:', {
        baseUrl,
        postUrl,
        postId,
        windowLocation: window.location,
      });
      
      await navigator.clipboard.writeText(postUrl);
      
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="sm"
        className="group"
        onClick={handleLike}
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
        className="group"
        onClick={onCommentClick}
      >
        <MessageCircle className="mr-1 h-4 w-4" />
        <span className="text-sm">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group"
        onClick={onRepostClick}
      >
        <Repeat className="mr-1 h-4 w-4" />
        <span className="text-sm">{repostCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group"
        onClick={handleCopyLink}
      >
        <LinkIcon className="mr-1 h-4 w-4" />
      </Button>

      {!isFullView && (
        <div className="flex items-center gap-1 ml-auto text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span className="text-sm">{viewsCount}</span>
        </div>
      )}
    </div>
  );
}