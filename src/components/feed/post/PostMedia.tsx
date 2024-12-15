import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FullScreenImage } from "@/components/shared/FullScreenImage";
import { Play } from "lucide-react";

interface PostMediaProps {
  mediaUrl?: string;
  mediaType?: string;
  title?: string;
  thumbnailUrl?: string;
}

export function PostMedia({ mediaUrl, mediaType, title, thumbnailUrl }: PostMediaProps) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!mediaUrl) return null;

  const fullUrl = supabase.storage
    .from('media')
    .getPublicUrl(mediaUrl)
    .data.publicUrl;

  const fullThumbnailUrl = thumbnailUrl ? supabase.storage
    .from('media')
    .getPublicUrl(thumbnailUrl)
    .data.publicUrl : null;

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
          {!isPlaying && fullThumbnailUrl && (
            <div 
              className="absolute inset-0 cursor-pointer group"
              onClick={() => setIsPlaying(true)}
            >
              <img
                src={fullThumbnailUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-16 h-16 text-white" />
              </div>
            </div>
          )}
          <video
            src={fullUrl}
            controls={isPlaying}
            className="w-full h-full object-contain"
            preload="metadata"
            style={{ display: isPlaying ? 'block' : 'none' }}
            onPlay={() => setIsPlaying(true)}
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