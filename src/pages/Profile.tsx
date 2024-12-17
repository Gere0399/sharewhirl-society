import { useState } from "react";
import { Sidebar } from "@/components/feed/Sidebar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostList } from "@/components/profile/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

export default function Profile() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <ProfileHeader />
        <PostList />
      </main>
      <CreatePostDialog isOpen={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </div>
  );
}
