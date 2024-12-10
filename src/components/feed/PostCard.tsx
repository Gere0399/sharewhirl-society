import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { PostHeader } from "./post/PostHeader";
import { PostContent } from "./post/PostContent";
import { PostMedia } from "./post/PostMedia";
import { PostActions } from "./post/PostActions";
import { trackPostView } from "@/utils/viewTracking";
import { RepostDialog } from "./post/RepostDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
  isFullView?: boolean;
}

export function PostCard({ post, currentUserId, onLike, isFullView = false }: PostCardProps) {
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const viewTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    if (!postRef.current || hasBeenViewed || !currentUserId) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Clear any existing timeout
            if (viewTimeoutRef.current) {
              clearTimeout(viewTimeoutRef.current);
            }

            // Start a new timer when the post comes into view
            viewTimeoutRef.current = setTimeout(async () => {
              await trackPostView(post.id, currentUserId);
              setHasBeenViewed(true);
            }, 2000); // 2 seconds delay
          } else {
            // Clear the timeout if the post goes out of view
            if (viewTimeoutRef.current) {
              clearTimeout(viewTimeoutRef.current);
            }
          }
        });
      },
      {
        threshold: 0.5, // 50% of the post must be visible
      }
    );

    observer.observe(postRef.current);
    
    return () => {
      observer.disconnect();
      if (viewTimeoutRef.current) {
        clearTimeout(viewTimeoutRef.current);
      }
    };
  }, [post.id, currentUserId, hasBeenViewed]);

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

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast({
        title: "Post deleted",
        description: "Your post has been successfully deleted",
      });

      if (isFullView) {
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`overflow-hidden border-none bg-transparent ${isFullView ? 'max-w-2xl mx-auto' : 'cursor-pointer'}`}>
      <div onClick={handleNavigateToPost} ref={postRef}>
        <CardHeader className="px-0 pt-0 pb-1">
          <PostHeader 
            profile={post.profiles}
            isAiGenerated={post.is_ai_generated}
            repostedFromUsername={post.reposted_from_username}
          />
        </CardHeader>

        <CardContent className="px-0 pb-1">
          <PostContent 
            title={post.title}
            content={post.content}
            tags={post.tags}
          />
          
          {post.media_url && (
            <div className="post-media -mx-4 sm:mx-0">
              <PostMedia 
                mediaUrl={post.media_url}
                mediaType={post.media_type}
                title={post.title}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between px-0 pt-1">
          <PostActions 
            postId={post.id}
            postTitle={post.title}
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            viewsCount={post.views_count}
            repostCount={post.repost_count}
            isLiked={post.likes?.some((like: any) => like.user_id === currentUserId)}
            isOwnPost={post.user_id === currentUserId}
            onLike={onLike}
            onCommentClick={() => {
              if (!isFullView) {
                navigate(`/post/${post.id}`);
              }
            }}
            onRepostClick={() => setIsRepostOpen(true)}
            onDeleteClick={handleDelete}
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
