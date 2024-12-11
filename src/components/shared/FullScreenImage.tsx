import { X } from "lucide-react";

interface FullScreenImageProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export function FullScreenImage({ src, alt, onClose }: FullScreenImageProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>
      <div className="h-full w-full flex items-center justify-center p-4">
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  );
}