import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentInputProps {
  onSubmit: (content: string, file: File | null) => Promise<void>;
  loading?: boolean;
}

export function CommentInput({ onSubmit, loading }: CommentInputProps) {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,audio/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!content.trim() && !file) {
      toast({
        title: "Error",
        description: "Please enter a comment or attach a file",
        variant: "destructive",
      });
      return;
    }

    await onSubmit(content, file);
    setContent("");
    setFile(null);
  };

  return (
    <div className="flex gap-4 p-4 border-b">
      <Textarea
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1"
      />
      <div className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleFileSelect}
          className="h-10 w-10"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          Post
        </Button>
      </div>
    </div>
  );
}