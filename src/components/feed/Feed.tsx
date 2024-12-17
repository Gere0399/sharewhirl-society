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
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isCreatePostOpen={isCreatePostOpen} 
        setIsCreatePostOpen={setIsCreatePostOpen} 
      />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <div className="container max-w-3xl py-4 md:py-8">
          <SearchBar />
          <TagsBar />
          <div className="mt-4 space-y-4">
            <PostCard />
          </div>
        </div>
      </main>
    </div>
  );
}