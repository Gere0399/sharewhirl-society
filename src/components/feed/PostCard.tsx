import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { CommentSection } from "./post/CommentSection";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
  isFullView?: boolean;
}

export function PostCard({ post, currentUserId, onLike, isFullView = false }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isLiked = post.likes?.some((like: any) => like.user_id === currentUserId);

  const handleNavigateToPost = (e: React.MouseEvent) => {
    if (isFullView) return;
    
    // Don't navigate if clicking on these elements
    const clickedElement = e.target as HTMLElement;
    const isClickingMedia = clickedElement.closest('.post-media');
    const isClickingButton = clickedElement.closest('button');
    const isClickingLink = clickedElement.closest('a');
    
    if (!isClickingMedia && !isClickingButton && !isClickingLink) {
      const postUrl = `/post/${post.id}`;
      if (location.pathname !== postUrl) {
        navigate(postUrl, { replace: true });
      }
    }
  };

  return (
    <Card className={`overflow-hidden border-none bg-transparent ${isFullView ? 'max-w-4xl mx-auto' : 'cursor-pointer'}`}>
      <div onClick={handleNavigateToPost}>
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
          
          <div className="post-media">
            <PostMedia 
              mediaUrl={post.media_url}
              mediaType={post.media_type}
              title={post.title}
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-between px-0">
          <PostActions 
            postId={post.id}
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            isLiked={isLiked}
            onLike={onLike}
            onCommentClick={() => setIsCommentsOpen(true)}
            onRepostClick={() => setIsRepostOpen(true)}
            isFullView={isFullView}
          />
        </CardFooter>
      </div>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <CommentSection 
            postId={post.id}
            currentUserId={currentUserId}
          />
        </DialogContent>
      </Dialog>
    </Card>
  );
}