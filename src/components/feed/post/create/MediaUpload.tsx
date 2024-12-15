import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface MediaUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
  thumbnail?: File | null;
  onThumbnailSelect?: (file: File | null) => void;
  showThumbnailUpload?: boolean;
}

export function MediaUpload({ 
  file, 
  onFileSelect, 
  thumbnail, 
  onThumbnailSelect,
  showThumbnailUpload 
}: MediaUploadProps) {
  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,video/*,audio/*";
    input.multiple = false;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];
      if (selectedFile) {
        onFileSelect(selectedFile);
      }
    };
    input.click();
  };

  const handleThumbnailSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = false;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];
      if (selectedFile && onThumbnailSelect) {
        onThumbnailSelect(selectedFile);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={handleFileSelect}
        className="w-full"
      >
        <Upload className="w-4 h-4 mr-2" />
        {file ? file.name : "Upload Media (Optional)"}
      </Button>
      {file && (
        <p className="text-sm text-muted-foreground">
          Selected file: {file.name}
        </p>
      )}

      {showThumbnailUpload && (
        <>
          <Button
            type="button"
            variant="outline"
            onClick={handleThumbnailSelect}
            className="w-full mt-4"
          >
            <Upload className="w-4 h-4 mr-2" />
            {thumbnail ? thumbnail.name : "Upload Video Thumbnail (Required)"}
          </Button>
          {thumbnail && (
            <p className="text-sm text-muted-foreground">
              Selected thumbnail: {thumbnail.name}
            </p>
          )}
        </>
      )}
    </div>
  );
}