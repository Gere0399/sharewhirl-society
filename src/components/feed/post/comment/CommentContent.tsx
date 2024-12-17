import { supabase } from "@/integrations/supabase/client";

interface CommentContentProps {
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
}

export function CommentContent({ content, mediaUrl, mediaType }: CommentContentProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-foreground/90">
        {content}
      </p>
      {mediaUrl && (
        <div className="mt-2">
          {mediaType === "image" ? (
            <img
              src={supabase.storage
                .from("media")
                .getPublicUrl(mediaUrl).data.publicUrl}
              alt="Comment attachment"
              className="rounded-lg max-w-sm"
            />
          ) : mediaType === "audio" ? (
            <audio
              src={supabase.storage
                .from("media")
                .getPublicUrl(mediaUrl).data.publicUrl}
              controls
              className="w-full"
            />
          ) : null}
        </div>
      )}
    </div>
  );
}