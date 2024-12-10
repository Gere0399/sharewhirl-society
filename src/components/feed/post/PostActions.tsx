import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link as LinkIcon, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ReportPostDialog } from "./ReportPostDialog";
import { PostStats } from "./PostStats";
import { PostActionButtons } from "./PostActionButtons";

interface PostActionsProps {
  postId: string;
  postTitle: string;
  likesCount: number;
  commentsCount: number;
  viewsCount?: number;
  repostCount?: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
  onLike: (postId: string) => void;
  onCommentClick: () => void;
  onRepostClick: () => void;
  onDeleteClick?: () => void;
  isFullView?: boolean;
}

export function PostActions({
  postId,
  postTitle,
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
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
      });

      onDeleteClick?.();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const baseUrl = window.location.origin;
      const postUrl = `${baseUrl}/post/${postId}`;
      
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
        <Button
          variant="ghost"
          size="sm"
          className="group"
          onClick={handleCopyLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwnPost ? (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsReportDialogOpen(true);
                }}
              >
                Report post
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ReportPostDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        postId={postId}
        postTitle={postTitle}
      />
    </div>
  );
}
