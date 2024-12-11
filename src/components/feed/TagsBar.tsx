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
    <div className="flex items-center gap-4 py-2 px-4 bg-background/95 backdrop-blur-sm border-b border-border/10">
      <div className="flex items-center gap-2 min-w-fit">
        <span 
          className={`text-sm cursor-pointer whitespace-nowrap ${
            activeTag === "for you" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => onTagSelect("for you")}
        >
          For You
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsTagDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <ScrollArea className="w-full">
        <div className="flex gap-4">
          {tags.map((tag) => (
            <div key={tag} className="group flex items-center gap-1">
              <span
                className={`text-sm cursor-pointer ${
                  activeTag === tag ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => onTagSelect(tag)}
              >
                #{tag}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTagRemove(tag);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="max-w-sm bg-background border border-border/10">
          <DialogHeader>
            <DialogTitle>Add Tags to Your Feed</DialogTitle>
          </DialogHeader>
          <Command className="rounded-lg border border-border/10">
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
                  >
                    #{searchQuery.toLowerCase()}
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