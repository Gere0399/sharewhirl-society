import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { ReportPostDialog } from "../ReportPostDialog";
import { supabase } from "@/integrations/supabase/client";

interface PostMenuProps {
  postId: string;
  postTitle: string;
  isOwnPost?: boolean;
  onDeleteClick?: () => void;
}

export function PostMenu({
  postId,
  postTitle,
  isOwnPost,
  onDeleteClick,
}: PostMenuProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // First, delete all notifications associated with the post
      const { error: notificationsError } = await supabase
        .from('notifications')
        .delete()
        .eq('post_id', postId);

      if (notificationsError) throw notificationsError;

      // Then, delete all comments associated with the post
      const { error: commentsError } = await supabase
        .from('comments')
        .delete()
        .eq('post_id', postId);

      if (commentsError) throw commentsError;

      // Then, delete all likes associated with the post
      const { error: likesError } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId);

      if (likesError) throw likesError;

      // Finally delete the post itself
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (postError) throw postError;

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

  return (
    <>
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

      <ReportPostDialog
        isOpen={isReportDialogOpen}
        onClose={() => setIsReportDialogOpen(false)}
        postId={postId}
        postTitle={postTitle}
      />
    </>
  );
}