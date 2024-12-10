import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

interface TagsBarProps {
  tags: string[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export function TagsBar({ tags, activeTag, onTagSelect, onTagRemove }: TagsBarProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleApplyTags = () => {
    // Here you would implement the logic to filter posts by multiple tags
    setIsTagDialogOpen(false);
  };

  return (
    <div className="w-full border-b border-border/40 backdrop-blur-sm">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-4">
          <Button
            variant={activeTag === "for you" ? "default" : "ghost"}
            onClick={() => onTagSelect("for you")}
            className="rounded-full"
          >
            For You
          </Button>
          
          <Separator orientation="vertical" className="h-8 mx-2" />
          
          {tags.map((tag) => (
            <div key={tag} className="flex items-center">
              <Button
                variant={activeTag === tag ? "default" : "ghost"}
                onClick={() => onTagSelect(tag)}
                className="rounded-full group relative"
              >
                #{tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagRemove(tag);
                  }}
                  className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => setIsTagDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Multiple Tags</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {tags.map((tag) => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                onClick={() => handleTagSelect(tag)}
                className="justify-between"
              >
                #{tag}
                {selectedTags.includes(tag) && <X className="h-4 w-4 ml-2" />}
              </Button>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyTags}>Apply Tags</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}