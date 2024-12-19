import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PostHeader } from "@/components/feed/post/PostHeader";
import { PostContent } from "@/components/feed/post/PostContent";
import { PostMedia } from "@/components/feed/post/PostMedia";
import { PostActions } from "@/components/feed/post/PostActions";
import { RepostDialog } from "@/components/feed/post/RepostDialog";
import { usePostSubscription } from "@/components/feed/post/hooks/usePostSubscription";
import { usePostActions } from "@/components/feed/post/hooks/usePostActions";
import { useViewTracking } from "@/components/feed/post/hooks/useViewTracking";
import { useInView } from "react-intersection-observer";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  isFullView?: boolean;
}

export function PostCard({ post: initialPost, currentUserId, isFullView = false }: PostCardProps) {
  const { post, setPost } = usePostSubscription(initialPost);
  const { handleLike } = usePostActions(currentUserId);
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { ref: postRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useViewTracking(inView ? post?.id : undefined, currentUserId);

  const handleNavigateToPost = (e: React.MouseEvent) => {
    console.log('[PostCard] Click event detected');
    
    if (isFullView) {
      console.log('[PostCard] Preventing navigation (full view)');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    const clickedElement = e.target as HTMLElement;
    const isClickingMedia = clickedElement.closest('.post-media');
    const isClickingButton = clickedElement.closest('button');
    const isClickingLink = clickedElement.closest('a');
    
    console.log('[PostCard] Click targets:', {
      isClickingMedia,
      isClickingButton,
      isClickingLink
    });
    
    if (!isClickingMedia && !isClickingButton && !isClickingLink) {
      console.log('[PostCard] Navigating to post detail');
      e.preventDefault();
      e.stopPropagation();
      const postUrl = `/post/${post.id}`;
      if (location.pathname !== postUrl) {
        navigate(postUrl);
      }
    } else {
      console.log('[PostCard] Preventing navigation (clicked on media/button/link)');
      e.preventDefault();
      e.stopPropagation();
    }
  };

  if (!post?.id) return null;

  return (
    <Card className="overflow-hidden border-0 bg-card transition-colors w-full">
      <div ref={postRef}>
        <div onClick={handleNavigateToPost}>
          <CardHeader className="px-4 pt-3 pb-1">
            <PostHeader 
              profile={post.profiles}
              isAiGenerated={post.is_ai_generated}
              repostedFromUsername={post.reposted_from_username}
              createdAt={post.created_at}
              currentUserId={currentUserId}
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
        </div>

        <CardFooter className="flex justify-between px-4 pt-1 pb-3" onClick={(e) => e.stopPropagation()}>
          <PostActions 
            postId={post.id}
            postTitle={post.title}
            content={post.content}
            tags={post.tags}
            isAiGenerated={post.is_ai_generated}
            createdAt={post.created_at}
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            viewsCount={post.views_count}
            repostCount={post.repost_count}
            isLiked={post.likes?.some((like: any) => like.user_id === currentUserId)}
            isOwnPost={post.user_id === currentUserId}
            onLike={() => {
              console.log('[PostCard] Like action triggered');
              handleLike(post.id, setPost);
            }}
            onCommentClick={() => {
              console.log('[PostCard] Comment action triggered');
              if (!isFullView) {
                navigate(`/post/${post.id}`);
              }
            }}
            onRepostClick={() => {
              console.log('[PostCard] Repost action triggered');
              setIsRepostOpen(true);
            }}
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