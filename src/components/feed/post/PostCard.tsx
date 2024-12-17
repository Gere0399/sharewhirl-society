import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PostHeader } from "./PostHeader";
import { PostContent } from "./PostContent";
import { PostMedia } from "./PostMedia";
import { PostActions } from "./PostActions";
import { trackPostView } from "@/utils/viewTracking";
import { RepostDialog } from "./RepostDialog";
import { usePostSubscription } from "./hooks/usePostSubscription";
import { usePostActions } from "./hooks/usePostActions";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  isFullView?: boolean;
}

export function PostCard({ post: initialPost, currentUserId, isFullView = false }: PostCardProps) {
  const { post, setPost } = usePostSubscription(initialPost);
  const { handleLike } = usePostActions(currentUserId);
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!postRef.current || hasBeenViewed || !currentUserId || !post?.id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            trackPostView(post.id, currentUserId);
            setHasBeenViewed(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(postRef.current);
    return () => observer.disconnect();
  }, [post?.id, currentUserId, hasBeenViewed]);

  const handleNavigateToPost = (e: React.MouseEvent) => {
    if (isFullView) return;
    
    const clickedElement = e.target as HTMLElement;
    const isClickingMedia = clickedElement.closest('.post-media');
    const isClickingButton = clickedElement.closest('button');
    const isClickingLink = clickedElement.closest('a');
    
    if (!isClickingMedia && !isClickingButton && !isClickingLink) {
      const postUrl = `/post/${post.id}`;
      if (location.pathname !== postUrl) {
        navigate(postUrl);
      }
    }
  };

  if (!post?.id) return null;

  return (
    <Card className="overflow-hidden border-0 bg-card transition-colors w-full">
      <div onClick={handleNavigateToPost} ref={postRef}>
        <CardHeader className="px-4 pt-4 pb-2">
          <PostHeader 
            profile={post.profiles}
            isAiGenerated={post.is_ai_generated}
            repostedFromUsername={post.reposted_from_username}
          />
        </CardHeader>

        <CardContent className="px-4 pb-2">
          <PostContent 
            title={post.title}
            content={post.content}
            tags={post.tags}
          />
          
          {post.media_url && (
            <div className="post-media -mx-4">
              <PostMedia 
                mediaUrl={post.media_url}
                mediaType={post.media_type}
                title={post.title}
                thumbnailUrl={post.thumbnail_url}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between px-4 pt-2 pb-4">
          <PostActions 
            postId={post.id}
            postTitle={post.title}
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            viewsCount={post.views_count}
            repostCount={post.repost_count}
            isLiked={post.likes?.some((like: any) => like.user_id === currentUserId)}
            isOwnPost={post.user_id === currentUserId}
            onLike={() => handleLike(post.id, setPost)}
            onCommentClick={() => {
              if (!isFullView) {
                navigate(`/post/${post.id}`);
              }
            }}
            onRepostClick={() => setIsRepostOpen(true)}
            isFullView={isFullView}
          />
        </CardFooter>
      </div>

      <RepostDialog
        isOpen={isRepostOpen}
        onClose={() => setIsRepostOpen(false)}
        post={post}
      />
    </Card>
  );
}