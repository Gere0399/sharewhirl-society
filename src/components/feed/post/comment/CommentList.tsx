import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface CommentListProps {
  comments: any[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="space-y-6 p-6">
      {comments.map((comment) => (
        <div key={comment.id} className="group flex gap-3">
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
          </div>
        </div>
      ))}
    </div>
  );
}