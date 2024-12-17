import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Trash2, Flag, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportPostDialog } from "../ReportPostDialog";
import { EditPostDialog } from "./EditPostDialog";

interface PostMenuProps {
  postId: string;
  postTitle: string;
  content: string;
  tags: string[];
  isAiGenerated: boolean;
  createdAt: string;
  isOwnPost?: boolean;
}

export function PostMenu({
  postId,
  postTitle,
  content,
  tags,
  isAiGenerated,
  createdAt,
  isOwnPost,
}: PostMenuProps) {
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const canEdit = isOwnPost && (
    new Date().getTime() - new Date(createdAt).getTime() <= 20 * 60 * 1000 // 20 minutes in milliseconds
  );

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting post:', error);
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
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          {isOwnPost ? (
            <>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete();
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete post
              </DropdownMenuItem>
              {canEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditDialogOpen(true);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit post
                </DropdownMenuItem>
              )}
            </>
          ) : (
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsReportDialogOpen(true);
              }}
            >
              <Flag className="mr-2 h-4 w-4" />
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

      {isOwnPost && (
        <EditPostDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          postId={postId}
          initialTitle={postTitle}
          initialContent={content}
          initialTags={tags}
          initialIsAiGenerated={isAiGenerated}
        />
      )}
    </>
  );
}