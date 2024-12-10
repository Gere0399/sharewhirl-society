import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/feed/Sidebar";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/post/comment/CommentSection";
import { Loader } from "lucide-react";

const PostView = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const session = supabase.auth.session();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postId = window.location.pathname.split("/").pop();
        const { data, error } = await supabase
          .from("posts")
          .select(`
            *,
            profiles!posts_user_id_fkey (
              username,
              avatar_url
            ),
            likes (
              user_id
            ),
            comments (
              id
            )
          `)
          .eq("id", postId)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <Loader className="h-6 w-6 animate-spin" />
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                {error}
              </div>
            ) : post ? (
              <>
                <PostCard
                  post={post}
                  currentUserId={session?.user?.id}
                  onLike={handleLike}
                  isFullView
                />
                <CommentSection
                  post={post}
                  currentUserId={session?.user?.id}
                />
              </>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostView;
