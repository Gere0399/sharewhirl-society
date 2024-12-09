import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface TagsBarProps {
  tags: string[];
  activeTag: string;
  onTagSelect: (tag: string) => void;
}

export function TagsBar({ tags, activeTag, onTagSelect }: TagsBarProps) {
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
          {tags.map((tag) => (
            <Button
              key={tag}
              variant={activeTag === tag ? "default" : "ghost"}
              onClick={() => onTagSelect(tag)}
              className="rounded-full"
            >
              #{tag}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}