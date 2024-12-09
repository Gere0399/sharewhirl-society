import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface CommentListProps {
  comments: any[];
}

export function CommentList({ comments }: CommentListProps) {
  return (
    <div className="p-4 space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="flex gap-4">
          <Avatar>
            <AvatarImage src={comment.profiles?.avatar_url} />
            <AvatarFallback>
              {comment.profiles?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-semibold">
              {comment.profiles?.username}
            </div>
            <p className="text-sm text-muted-foreground">
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
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(comment.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}