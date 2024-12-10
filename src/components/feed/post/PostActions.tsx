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
      // Get the current URL from the window location
      const currentLocation = window.location;
      
      // Construct the absolute URL ensuring we maintain the same protocol (http/https)
      const baseUrl = `${currentLocation.protocol}//${currentLocation.host}`;
      const postUrl = `${baseUrl}/post/${postId}`;
      
      console.log('Copy link debug:', {
        currentLocation,
        baseUrl,
        postUrl,
        protocol: currentLocation.protocol,
        host: currentLocation.host,
        postId
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