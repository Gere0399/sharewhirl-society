import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { TagsBar } from "./TagsBar";
import { PostCard } from "./post/PostCard";
import { Sidebar } from "./Sidebar";

interface FeedProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

export function Feed({ isCreatePostOpen, setIsCreatePostOpen }: FeedProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState<string>("for you");

  const handleTagSelect = (tag: string) => {
    setActiveTag(tag);
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
    if (activeTag === tagToRemove) {
      setActiveTag("for you");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCreatePostOpen={isCreatePostOpen} 
        setIsCreatePostOpen={setIsCreatePostOpen} 
      />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <div className="container max-w-3xl py-4 md:py-8">
          <SearchBar />
          <TagsBar 
            tags={tags}
            activeTag={activeTag}
            onTagSelect={handleTagSelect}
            onTagRemove={handleTagRemove}
          />
          <div className="mt-4 space-y-4">
            <PostCard 
              post={{
                id: "1",
                title: "Example Post",
                content: "This is an example post",
                created_at: new Date().toISOString(),
                user_id: "1",
                // Add other required post properties
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}