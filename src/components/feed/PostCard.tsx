import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostMedia } from "./post/PostMedia";
import { PostActions } from "./post/PostActions";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const isLiked = post.likes?.some((like: any) => like.user_id === currentUserId);

  return (
    <Card className="overflow-hidden border-none bg-transparent">
      <CardHeader>
        <PostHeader 
          profile={post.profiles}
          isAiGenerated={post.is_ai_generated}
          repostedFromUsername={post.reposted_from_username}
        />
      </CardHeader>

      <CardContent className="px-0">
        <PostContent 
          title={post.title}
          content={post.content}
          tags={post.tags}
        />
        
        <PostMedia 
          mediaUrl={post.media_url}
          mediaType={post.media_type}
          title={post.title}
        />
      </CardContent>

      <CardFooter className="flex justify-between px-0">
        <PostActions 
          postId={post.id}
          likesCount={post.likes_count}
          commentsCount={post.comments_count}
          isLiked={isLiked}
          onLike={onLike}
          onCommentClick={() => setIsCommentsOpen(true)}
        />
      </CardFooter>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            <p className="text-muted-foreground text-center py-8">
              Comments feature coming soon
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}