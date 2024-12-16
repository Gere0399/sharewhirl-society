import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MoreVertical, Trash2, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportPostDialog } from "../ReportPostDialog";
import { useState } from "react";

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
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDeleteClick?.();
              }}
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
    </>
  );
}