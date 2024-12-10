import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface MediaUploadProps {
  file: File | null;
  onFileSelect: (file: File | null) => void;
}

export function MediaUpload({ file, onFileSelect }: MediaUploadProps) {
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
    </div>
  );
}