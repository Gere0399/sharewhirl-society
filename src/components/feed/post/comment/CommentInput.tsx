import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentInputProps {
  onSubmit: (content: string, file: File | null) => Promise<void>;
  loading?: boolean;
  placeholder?: string;
}

export function CommentInput({ onSubmit, loading, placeholder = "Write a comment..." }: CommentInputProps) {
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
    <div className="flex gap-2 p-4 border-b relative">
      <Textarea
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 pr-20"
      />
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFileSelect}
          className="h-8 w-8"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          size="sm"
        >
          Post
        </Button>
      </div>
    </div>
  );
}