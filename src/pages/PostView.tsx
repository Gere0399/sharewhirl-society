import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/feed/Sidebar";
import { PostCard } from "@/components/feed/PostCard";
import { CommentSection } from "@/components/feed/post/CommentSection";
import { Loader } from "lucide-react";

const PostView = () => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

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
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-4 py-8 pb-20 md:pb-8 md:px-0">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : post ? (
            <>
              <PostCard
                post={post}
                currentUserId={session?.user?.id}
                isFullView
              />
              <CommentSection
                postId={post.id}
                currentUserId={session?.user?.id}
              />
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
};

export default PostView;