interface PostMediaProps {
  mediaUrl?: string;
  mediaType?: string;
  title?: string;
}

export function PostMedia({ mediaUrl, mediaType, title }: PostMediaProps) {
  if (!mediaUrl) return null;

  const aspectRatioClass = "aspect-video";

  switch (mediaType) {
    case "image":
      return (
        <div className={`relative ${aspectRatioClass} rounded-lg overflow-hidden bg-muted`}>
          <img
            src={mediaUrl}
            alt={title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>
      );
    case "video":
      return (
        <div className={`relative ${aspectRatioClass} rounded-lg overflow-hidden bg-muted`}>
          <video
            src={mediaUrl}
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
            src={mediaUrl}
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