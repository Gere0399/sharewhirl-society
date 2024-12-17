import { useState } from "react";
import { Feed } from "@/components/feed/Feed";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

export default function Index() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  return (
    <>
      <Feed isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <CreatePostDialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </>
  );
}