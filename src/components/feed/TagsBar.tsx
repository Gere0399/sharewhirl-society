import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

interface TagsBarProps {
  tags: string[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

const SUGGESTED_TAGS = [
  "technology",
  "art",
  "music",
  "gaming",
  "sports",
  "food",
  "travel",
  "fashion",
  "science",
  "books",
  "movies",
  "photography",
  "design",
  "coding",
  "nature",
];

export function TagsBar({ tags, activeTag, onTagSelect, onTagRemove }: TagsBarProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleApplyTags = () => {
    selectedTags.forEach((tag) => {
      if (!tags.includes(tag)) {
        onTagSelect(tag);
      }
    });
    setIsTagDialogOpen(false);
    setSelectedTags([]);
    setSearchQuery("");
  };

  const filteredTags = SUGGESTED_TAGS.filter(
    (tag) => 
      tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !tags.includes(tag)
  );

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2 p-2">
          <Button
            variant={activeTag === "for you" ? "default" : "ghost"}
            onClick={() => onTagSelect("for you")}
            className="rounded-full"
          >
            For You
          </Button>
          
          <Separator orientation="vertical" className="h-8" />
          
          {tags.map((tag) => (
            <div key={tag} className="flex items-center">
              <Button
                variant={activeTag === tag ? "default" : "ghost"}
                onClick={() => onTagSelect(tag)}
                className="rounded-full group relative"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag}
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
            <DialogTitle>Add Tags to Your Feed</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-2">
              {filteredTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  onClick={() => handleTagSelect(tag)}
                  className="justify-between"
                >
                  <span className="flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    {tag}
                  </span>
                  {selectedTags.includes(tag) && <X className="h-4 w-4 ml-2" />}
                </Button>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsTagDialogOpen(false);
                setSelectedTags([]);
                setSearchQuery("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleApplyTags}>Add Tags</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}