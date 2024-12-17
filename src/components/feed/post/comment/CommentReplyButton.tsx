import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentReplyButtonProps {
  onClick: () => void;
}

export function CommentReplyButton({ onClick }: CommentReplyButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={onClick}
    >
      <MessageCircle className="h-4 w-4 mr-1" />
      Reply
    </Button>
  );
}