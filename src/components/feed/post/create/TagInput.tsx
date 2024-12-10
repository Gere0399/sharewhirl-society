import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

export function TagInput({ tags, setTags }: TagInputProps) {
  const [currentTag, setCurrentTag] = useState("");

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && currentTag.trim()) {
      e.preventDefault();
      const newTag = currentTag.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <Label>Tags (Optional)</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            #{tag}
            <button
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-destructive"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <Input
        placeholder="Add tags (press Enter or comma to add)"
        value={currentTag}
        onChange={(e) => setCurrentTag(e.target.value)}
        onKeyDown={handleTagKeyDown}
      />
    </div>
  );
}