import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, ChevronDown, ChevronUp, Heart, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CommentInput } from "./CommentInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const hasReplies = replies.length > 0;
  const isExpanded = expandedComments.includes(comment.id);
  const isOwnComment = currentUserId === comment.user_id;

  const handleDelete = async () => {
    try {
      // First delete all likes for this comment
      const { error: likesError } = await supabase
        .from('comments_likes')
        .delete()
        .eq('comment_id', comment.id);

      if (likesError) throw likesError;

      // Then delete the comment
      await onDelete(comment.id);
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
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
              onClick={() => onLike(comment.id)}
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
                onClick={() => onToggleReplies(comment.id)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 mr-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-1" />
                )}
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
            {isOwnComment && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this comment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(comment.id)}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              replies={[]} // Nested replies not supported
              expandedComments={expandedComments}
              onToggleReplies={onToggleReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
}