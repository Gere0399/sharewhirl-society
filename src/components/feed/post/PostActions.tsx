import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Link as LinkIcon,
  Eye
} from "lucide-react";

interface PostActionsProps {
  postId: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
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
  isLiked, 
  onLike,
  onCommentClick,
  onRepostClick,
  isFullView = false
}: PostActionsProps) {
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const { toast } = useToast();

  const handleLikeClick = () => {
    setIsLikeAnimating(true);
    onLike(postId);
    setTimeout(() => setIsLikeAnimating(false), 1000);
  };

  const handleCopyLink = async () => {
    try {
      // Get the window location origin (protocol + hostname + port)
      const origin = window.location.origin;
      const postUrl = `${origin}/post/${postId}`;
      
      console.log('Window location:', {
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        generatedUrl: postUrl
      });
      
      await navigator.clipboard.writeText(postUrl);
      
      toast({
        title: "Link copied!",
        description: "The post link has been copied to your clipboard.",
      });
    } catch (err) {
      console.error('Copy failed:', err);
      toast({
        title: "Failed to copy link",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-4 w-full">
      <Button
        variant="ghost"
        size="sm"
        className={`group ${isLiked ? 'text-red-500' : ''}`}
        onClick={handleLikeClick}
      >
        <Heart
          className={`mr-1 h-4 w-4 ${
            isLiked ? 'fill-current' : 'group-hover:fill-current'
          } ${isLikeAnimating ? 'animate-ping' : ''}`}
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
        <Share2 className="mr-1 h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="group ml-auto"
        onClick={handleCopyLink}
      >
        <LinkIcon className="mr-1 h-4 w-4" />
        <span className="text-sm">Copy link</span>
      </Button>

      <div className="flex items-center gap-1 text-muted-foreground">
        <Eye className="h-4 w-4" />
        <span className="text-sm">{viewsCount}</span>
      </div>
    </div>
  );
}