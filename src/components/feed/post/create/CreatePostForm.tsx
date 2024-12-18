import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TagInput } from "./TagInput";
import { MediaUpload } from "./MediaUpload";
import { useToast } from "@/hooks/use-toast";

interface CreatePostFormProps {
  onSubmit: (data: {
    title: string;
    tags: string[];
    isAiGenerated: boolean;
    file: File | null;
    thumbnail?: File | null;
  }) => Promise<void>;
  uploading: boolean;
}

export function CreatePostForm({ onSubmit, uploading }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (file?.type.startsWith("video/") && !thumbnail) {
      toast({
        title: "Error",
        description: "Please upload a thumbnail for your video",
        variant: "destructive",
      });
      return;
    }

    await onSubmit({
      title,
      tags,
      isAiGenerated,
      file,
      thumbnail: file?.type.startsWith("video/") ? thumbnail : null,
    });
    
    // Reset form
    setTitle("");
    setTags([]);
    setIsAiGenerated(false);
    setFile(null);
    setThumbnail(null);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 250) {
      setTitle(value);
    }
  };

  const handleTagsChange = (newTags: string[]) => {
    if (newTags.length <= 5) {
      setTags(newTags);
    } else {
      toast({
        title: "Maximum tags reached",
        description: "You can only add up to 5 tags",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Input
          placeholder="Post Title (max 250 characters)"
          value={title}
          onChange={handleTitleChange}
          maxLength={250}
        />
        <div className="text-xs text-muted-foreground text-right">
          {title.length}/250
        </div>
      </div>
      
      <TagInput tags={tags} setTags={handleTagsChange} />
      
      <div className="flex items-center space-x-2">
        <Switch
          id="ai-generated"
          checked={isAiGenerated}
          onCheckedChange={setIsAiGenerated}
        />
        <Label htmlFor="ai-generated">AI Generated Content</Label>
      </div>
      
      <MediaUpload 
        file={file} 
        onFileSelect={setFile}
        thumbnail={thumbnail}
        onThumbnailSelect={setThumbnail}
        showThumbnailUpload={file?.type.startsWith("video/") || false}
      />

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