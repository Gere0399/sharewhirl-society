import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenImage } from "@/components/shared/FullScreenImage";

interface PostMediaProps {
  mediaUrl?: string;
  mediaType?: string;
  title?: string;
}

export function PostMedia({ mediaUrl, mediaType, title }: PostMediaProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!mediaUrl) return null;

  const fullUrl = supabase.storage
    .from('media')
    .getPublicUrl(mediaUrl)
    .data.publicUrl;

  switch (mediaType) {
    case "image":
      return (
        <>
          <div 
            className="relative w-full rounded-lg overflow-hidden bg-muted aspect-[16/9] cursor-pointer"
            onClick={() => setIsFullScreen(true)}
          >
            <img
              src={fullUrl}
              alt={title}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
          {isFullScreen && (
            <FullScreenImage
              src={fullUrl}
              alt={title || ""}
              onClose={() => setIsFullScreen(false)}
            />
          )}
        </>
      );
    case "video":
      return (
        <div className="relative w-full rounded-lg overflow-hidden bg-muted aspect-[16/9]">
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