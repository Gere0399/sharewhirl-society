import { Label } from "@/components/ui/label";
import { MediaUpload } from "@/components/feed/post/create/MediaUpload";

interface AudioUploadProps {
  file: File | null;
  setFile: (file: File | null) => void;
  required?: boolean;
}

export function AudioUpload({ file, setFile, required = false }: AudioUploadProps) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        Source Audio
        {required && <span className="text-red-500">*</span>}
      </Label>
      <MediaUpload file={file} onFileSelect={setFile} />
      <div className="text-sm text-muted-foreground">
        Upload an audio file to use as input for speech generation
      </div>
    </div>
  );
}