import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/feed/PostCard";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PostView = () => {
  const { postId } = useParams();
  const { toast } = useToast();

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
      return data;
    },
  });

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
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PostCard
        post={post}
        currentUserId={session?.user?.id}
        onLike={handleLike}
        isFullView={true}
      />
    </div>
  );
};

export default PostView;