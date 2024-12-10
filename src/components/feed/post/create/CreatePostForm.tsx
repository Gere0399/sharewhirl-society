import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "./TagInput";
import { MediaUpload } from "./MediaUpload";

interface CreatePostFormProps {
  onSubmit: (data: {
    title: string;
    tags: string[];
    isAiGenerated: boolean;
    file: File | null;
  }) => Promise<void>;
  uploading: boolean;
}

export function CreatePostForm({ onSubmit, uploading }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    await onSubmit({
      title,
      tags,
      isAiGenerated,
      file,
    });
    
    // Reset form
    setTitle("");
    setTags([]);
    setIsAiGenerated(false);
    setFile(null);
  };

  return (
    <div className="space-y-6">
      <Input
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <TagInput tags={tags} setTags={setTags} />
      
      <div className="flex items-center space-x-2">
        <Switch
          id="ai-generated"
          checked={isAiGenerated}
          onCheckedChange={setIsAiGenerated}
        />
        <Label htmlFor="ai-generated">AI Generated Content</Label>
      </div>
      
      <MediaUpload file={file} onFileSelect={setFile} />

      <Button
        onClick={handleSubmit}
        disabled={uploading || !title.trim()}
        className="w-full"
      >
        {uploading ? "Creating Post..." : "Create Post"}
      </Button>
    </div>
  );
}