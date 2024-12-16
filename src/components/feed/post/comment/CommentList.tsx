import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentItem } from "./CommentItem";

interface CommentListProps {
  comments: any[];
  currentUserId?: string;
  onCommentSubmit: (content: string, file: File | null, parentCommentId?: string) => Promise<void>;
  onCommentsUpdate: (comments: any[]) => void;
}

export function CommentList({ 
  comments, 
  currentUserId, 
  onCommentSubmit, 
  onCommentsUpdate 
}: CommentListProps) {
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const { toast } = useToast();

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

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Update local state
      const updatedComments = comments.filter(comment => comment.id !== commentId);
      onCommentsUpdate(updatedComments);

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to like comments",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: existingLike, error: fetchError } = await supabase
        .from('comments_likes')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('comments_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('comments_likes')
          .insert({ 
            comment_id: commentId, 
            user_id: currentUserId 
          });

        if (insertError) throw insertError;
      }

      // Update local state
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes_count: existingLike 
              ? (comment.likes_count || 0) - 1 
              : (comment.likes_count || 0) + 1,
            is_liked: !existingLike
          };
        }
        return comment;
      });
      onCommentsUpdate(updatedComments);
    } catch (error: any) {
      console.error('Error handling comment like:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6">
      {topLevelComments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          onCommentSubmit={onCommentSubmit}
          onDelete={handleDeleteComment}
          onLike={handleLikeComment}
          replies={getReplies(comment.id)}
          expandedComments={expandedComments}
          onToggleReplies={toggleReplies}
        />
      ))}
    </div>
  );
}