import { useState, useEffect, useRef } from "react";
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
import { trackPostView } from "@/utils/viewTracking";
import { RepostDialog } from "@/components/feed/post/RepostDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
  isFullView?: boolean;
}

export function PostCard({ post: initialPost, currentUserId, onLike, isFullView = false }: PostCardProps) {
  const [post, setPost] = useState(initialPost);
  const [isRepostOpen, setIsRepostOpen] = useState(false);
  const [hasBeenViewed, setHasBeenViewed] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!post?.id) return;

    // Subscribe to real-time updates for this post
    const postChannel = supabase
      .channel(`post-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `id=eq.${post.id}`
        },
        (payload: any) => {
          console.log('Post update received:', payload);
          if (payload.new) {
            setPost((prevPost: any) => ({
              ...prevPost,
              ...payload.new,
              profiles: prevPost.profiles // Preserve profiles data
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to likes for this post
    const likesChannel = supabase
      .channel(`likes-${post.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes',
          filter: `post_id=eq.${post.id}`
        },
        async () => {
          console.log('Likes update received for post:', post.id);
          const { data } = await supabase
            .from('posts')
            .select(`
              *,
              profiles!posts_user_id_fkey (
                username,
                avatar_url,
                created_at,
                bio,
                user_id,
                followers_count
              ),
              likes (
                user_id
              )
            `)
            .eq('id', post.id)
            .single();

          if (data) {
            setPost(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [post?.id]);

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
      {
        threshold: 0.1,
      }
    );

    observer.observe(postRef.current);
    
    return () => {
      observer.disconnect();
    };
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
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
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