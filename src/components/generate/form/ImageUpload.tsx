import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/feed/post/create/MediaUpload";

interface ImageUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  required?: boolean;
}

export function ImageUpload({ file, setFile, required = false }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        Source Image
        {required && <span className="text-red-500">*</span>}
      </Label>
      <MediaUpload file={file} onFileSelect={setFile} />
      <div className="text-sm text-muted-foreground">
        Upload an image to use as reference for generation
      </div>
    </div>
  );
}