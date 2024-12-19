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

  const navigateToPost = () => {
    if (!isFullView) {
      const postUrl = `/post/${post.id}`;
      if (location.pathname !== postUrl) {
        navigate(postUrl);
      }
    }
  };

  if (!post?.id) return null;

  return (
    <Card className="overflow-hidden border-0 bg-card transition-colors w-full">
      <div ref={postRef}>
        <div role="button" tabIndex={0} onClick={navigateToPost} onKeyDown={(e) => e.key === 'Enter' && navigateToPost()}>
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
              <div className="post-media -mx-4" onClick={(e) => e.stopPropagation()}>
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