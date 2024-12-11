import { PostCard } from "@/components/feed/PostCard";

interface PostListProps {
  posts: any[];
  currentUserId?: string;
  onLike: (postId: string) => Promise<void>;
}

export function PostList({ posts, currentUserId, onLike }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  return (
    <div className="grid gap-4"> {/* Reduced gap from gap-6 to gap-4 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onLike={onLike}
        />
      ))}
    </div>
  );
}