import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/post/CommentSection";
import { Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/feed/Sidebar";
import { PostViewError } from "@/components/post/PostViewError";
import { PostViewLoading } from "@/components/post/PostViewLoading";
import { usePostActions } from "@/hooks/usePostActions";

const PostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { handleLike } = usePostActions();

  // Get session data
  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Fetch post data
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID is required');
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            avatar_url,
            bio,
            created_at
          ),
          likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Post not found');

      return {
        ...data,
        likes_count: data.likes?.length || 0,
        comments_count: data.comments?.length || 0
      };
    },
    retry: 2,
    retryDelay: 1000,
  });

  // Handle error state
  if (error) {
    return <PostViewError onGoHome={() => navigate('/')} />;
  }

  // Handle loading state
  if (isLoading) {
    return <PostViewLoading />;
  }

  // Handle not found state
  if (!post) {
    return <PostViewError onGoHome={() => navigate('/')} isNotFound />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-16">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <PostCard
            post={post}
            currentUserId={session?.user?.id}
            onLike={handleLike}
            isFullView={true}
          />

          <div className="mt-4 border-t border-border/40 pt-4">
            <CommentSection 
              postId={post.id}
              currentUserId={session?.user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostView;