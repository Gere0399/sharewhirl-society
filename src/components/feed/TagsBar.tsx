import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, X, Tag, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";

interface TagsBarProps {
  tags: string[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
}

export function TagsBar({ tags, activeTag, onTagSelect, onTagRemove }: TagsBarProps) {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleTagSelect = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagSelect(tag);
    }
    setIsTagDialogOpen(false);
    setSearchQuery("");
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-background/60 backdrop-blur-sm">
      <Button
        variant={activeTag === "for you" ? "default" : "ghost"}
        onClick={() => onTagSelect("for you")}
        size="sm"
        className="shrink-0"
      >
        <Home className="h-4 w-4 mr-1" />
        For You
      </Button>
      
      <ScrollArea className="w-full">
        <div className="flex space-x-2">
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "secondary"}
              size="sm"
              className="shrink-0 group"
              onClick={() => onTagSelect(tag)}
            >
              <Tag className="h-3 w-3 mr-1" />
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
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <Button
        variant="outline"
        size="sm"
        className="shrink-0"
        onClick={() => setIsTagDialogOpen(true)}
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Tags to Your Feed</DialogTitle>
          </DialogHeader>
          <Command>
            <Input
              placeholder="Search tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {searchQuery && (
                  <CommandItem
                    onSelect={() => handleTagSelect(searchQuery.toLowerCase())}
                    className="flex items-center"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    {searchQuery.toLowerCase()}
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
}