import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CommentInput } from "./CommentInput";
import { CommentLikeButton } from "./CommentLikeButton";
import { CommentReplyButton } from "./CommentReplyButton";
import { CommentRepliesButton } from "./CommentRepliesButton";
import { CommentDeleteButton } from "./CommentDeleteButton";
import { CommentContent } from "./CommentContent";

interface CommentItemProps {
  comment: any;
  currentUserId?: string;
  onCommentSubmit: (content: string, file: File | null, parentCommentId?: string) => Promise<void>;
  onDelete: (commentId: string) => Promise<void>;
  onLike: (commentId: string) => Promise<void>;
  isReply?: boolean;
  replies: any[];
  expandedComments: string[];
  onToggleReplies: (commentId: string) => void;
}

export function CommentItem({
  comment,
  currentUserId,
  onCommentSubmit,
  onDelete,
  onLike,
  isReply = false,
  replies,
  expandedComments,
  onToggleReplies,
}: CommentItemProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likesCount, setLikesCount] = useState(comment.likes_count || 0);
  const [isLiked, setIsLiked] = useState(comment.is_liked || false);
  const { toast } = useToast();
  const hasReplies = replies.length > 0;
  const isExpanded = expandedComments.includes(comment.id);
  const isOwnComment = currentUserId === comment.user_id;

  useEffect(() => {
    const channel = supabase
      .channel(`comment-${comment.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `id=eq.${comment.id}`
        },
        (payload: any) => {
          if (payload.new) {
            setLikesCount(payload.new.likes_count || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [comment.id]);

  const handleLike = async () => {
    try {
      if (!currentUserId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to like comments",
          variant: "destructive",
        });
        return;
      }
      
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
      
      await onLike(comment.id);
    } catch (error: any) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      
      console.error('Error liking comment:', error);
      toast({
        title: "Error",
        description: "Failed to like comment",
        variant: "destructive",
      });
    }
  };

  const handleReplySubmit = async (content: string, file: File | null) => {
    if (replyingTo) {
      await onCommentSubmit(content, file, replyingTo);
      setReplyingTo(null);
    }
  };

  return (
    <div className={`group ${isReply ? 'ml-8 mt-4' : 'mt-6 first:mt-0'}`}>
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
          
          <CommentContent 
            content={comment.content}
            mediaUrl={comment.media_url}
            mediaType={comment.media_type}
          />

          <div className="flex gap-2 mt-2">
            <CommentLikeButton
              isLiked={isLiked}
              likesCount={likesCount}
              onLike={handleLike}
            />
            <CommentReplyButton
              onClick={() => setReplyingTo(comment.id)}
            />
            {hasReplies && (
              <CommentRepliesButton
                repliesCount={replies.length}
                isExpanded={isExpanded}
                onClick={() => onToggleReplies(comment.id)}
              />
            )}
            {isOwnComment && (
              <CommentDeleteButton
                onDelete={() => onDelete(comment.id)}
              />
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
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onCommentSubmit={onCommentSubmit}
              onDelete={onDelete}
              onLike={onLike}
              isReply={true}
              replies={[]}
              expandedComments={expandedComments}
              onToggleReplies={onToggleReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
}