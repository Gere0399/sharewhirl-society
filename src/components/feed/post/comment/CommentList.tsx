import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CommentInput } from "./CommentInput";

interface CommentListProps {
  comments: any[];
  currentUserId?: string;
  onCommentSubmit: (content: string, file: File | null, parentCommentId?: string) => Promise<void>;
}

export function CommentList({ comments, currentUserId, onCommentSubmit }: CommentListProps) {
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  // Filter top-level comments (no parent_comment_id)
  const topLevelComments = comments.filter(comment => !comment.parent_comment_id);
  
  // Get replies for a specific comment
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
    <div className="space-y-6 p-6">
      {topLevelComments.map(comment => renderComment(comment))}
    </div>
  );
}