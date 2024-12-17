import { PostCard } from "@/components/feed/PostCard";

interface PostListProps {
  posts: any[];
  currentUserId?: string;
}

export function PostList({ posts, currentUserId }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  return (
    <div className="grid gap-4 w-full mt-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}