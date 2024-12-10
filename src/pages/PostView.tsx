import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/post/CommentSection";
import { Loader, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/feed/Sidebar";
import { useEffect } from "react";

const PostView = () => {
  const { postId } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const { data: post, isLoading } = useQuery({
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
    retry: false,
  });

  // Add view mutation
  const addView = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id || !postId) return;
      
      const { error } = await supabase
        .from('post_views')
        .insert({ post_id: postId, user_id: session.user.id })
        .select()
        .single();

      if (error && error.code !== '23505') { // Ignore unique violation errors
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  // Add view when post is loaded
  useEffect(() => {
    if (session?.user?.id && postId) {
      addView.mutate();
    }
  }, [session?.user?.id, postId]);

  const handleLike = async (postId: string) => {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', session?.user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session?.user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: session?.user.id });
      }

      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <div className="flex justify-center items-center min-h-screen">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <div className="flex justify-center items-center min-h-screen">
            <p className="text-muted-foreground">Post not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
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

          <div className="mt-8 border-t border-border/40 pt-8">
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