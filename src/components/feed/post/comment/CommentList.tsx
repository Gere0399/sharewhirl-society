import { useState } from "react";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: any[];
  currentUserId?: string;
  onCommentSubmit: (content: string, file: File | null, parentCommentId?: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
}

export function CommentList({ 
  comments, 
  currentUserId, 
  onCommentSubmit,
  onDelete,
  onLike
}: CommentListProps) {
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
  
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parent_comment_id === commentId);
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  return (
    <div className="p-6">
      {topLevelComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onCommentSubmit={onCommentSubmit}
          onDelete={onDelete}
          onLike={onLike}
          replies={getReplies(comment.id)}
          expandedComments={expandedComments}
          onToggleReplies={toggleReplies}
        />
      ))}
    </div>
  );
}