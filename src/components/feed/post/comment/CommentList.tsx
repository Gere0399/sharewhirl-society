import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CommentInput } from "./CommentInput";
import { useToast } from "@/hooks/use-toast";

interface CommentListProps {
  comments: any[];
  currentUserId?: string;
  onCommentSubmit: (content: string, file: File | null, parentCommentId?: string) => Promise<void>;
  onCommentsUpdate: (comments: any[]) => void;
}

export function CommentList({ comments, currentUserId, onCommentSubmit, onCommentsUpdate }: CommentListProps) {
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
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

  const handleReplySubmit = async (content: string, file: File | null) => {
    if (replyingTo) {
      await onCommentSubmit(content, file, replyingTo);
      setReplyingTo(null);
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

      // Refresh comments to update likes
      const { data: updatedComment, error: updateError } = await supabase
        .from('comments')
        .select(`
          *,
          comments_likes (
            user_id
          )
        `)
        .eq('id', commentId)
        .single();

      if (updateError) throw updateError;

      // Update the comment in the local state
      const updatedComments = comments.map(comment => 
        comment.id === commentId 
          ? {
              ...comment,
              likes_count: updatedComment.likes_count,
              is_liked: updatedComment.comments_likes.some((like: any) => like.user_id === currentUserId)
            }
          : comment
      );

      // Update the parent component's state through the callback
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

  const renderComment = (comment: any, isReply = false) => {
    const replies = getReplies(comment.id);
    const hasReplies = replies.length > 0;
    const isExpanded = expandedComments.includes(comment.id);

    return (
      <div key={comment.id} className={`group ${isReply ? 'ml-8 mt-4' : 'mt-6 first:mt-0'}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback>
              {comment.profiles?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">
                {comment.profiles?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-foreground/90">
              {comment.content}
            </p>
            {comment.media_url && (
              <div className="mt-2">
                {comment.media_type === "image" ? (
                  <img
                    src={supabase.storage
                      .from("media")
                      .getPublicUrl(comment.media_url).data.publicUrl}
                    alt="Comment attachment"
                    className="rounded-lg max-w-sm"
                  />
                ) : comment.media_type === "audio" ? (
                  <audio
                    src={supabase.storage
                      .from("media")
                      .getPublicUrl(comment.media_url).data.publicUrl}
                    controls
                    className="w-full"
                  />
                ) : null}
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-2 ${comment.is_liked ? 'text-red-500' : ''}`}
                onClick={() => handleLikeComment(comment.id)}
              >
                <Heart className={`h-4 w-4 mr-1 ${comment.is_liked ? 'fill-current' : ''}`} />
                {comment.likes_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => setReplyingTo(comment.id)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Reply
              </Button>
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => toggleReplies(comment.id)}
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 mr-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 mr-1" />
                  )}
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {replyingTo === comment.id && (
          <div className="ml-11 mt-2">
            <CommentInput 
              onSubmit={handleReplySubmit}
              placeholder="Write a reply..."
            />
          </div>
        )}

        {isExpanded && hasReplies && (
          <div className="space-y-4">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {topLevelComments.map(comment => renderComment(comment))}
    </div>
  );
}