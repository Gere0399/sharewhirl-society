import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentRepliesButtonProps {
  repliesCount: number;
  isExpanded: boolean;
  onClick: () => void;
}

export function CommentRepliesButton({ repliesCount, isExpanded, onClick }: CommentRepliesButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={onClick}
    >
      {isExpanded ? (
        <ChevronUp className="h-4 w-4 mr-1" />
      ) : (
        <ChevronDown className="h-4 w-4 mr-1" />
      )}
      {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
    </Button>
  );
}