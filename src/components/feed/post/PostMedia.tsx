import { supabase } from "@/integrations/supabase/client";

interface PostMediaProps {
  mediaUrl?: string;
  mediaType?: string;
  title?: string;
}

export function PostMedia({ mediaUrl, mediaType, title }: PostMediaProps) {
  if (!mediaUrl) return null;

  const fullUrl = supabase.storage
    .from('media')
    .getPublicUrl(mediaUrl)
    .data.publicUrl;

  switch (mediaType) {
    case "image":
      return (
        <div className="relative w-full rounded-lg overflow-hidden bg-muted">
          <img
            src={fullUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      );
    case "video":
      return (
        <div className="relative w-full rounded-lg overflow-hidden bg-muted">
          <video
            src={fullUrl}
            controls
            className="w-full h-full object-contain"
            preload="metadata"
          />
        </div>
      );
    case "audio":
      return (
        <div className="rounded-lg overflow-hidden bg-muted p-4">
          <audio
            src={fullUrl}
            controls
            className="w-full"
            preload="metadata"
          />
        </div>
      );
    default:
      return null;
  }
}
