import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sidebar } from "@/components/feed/Sidebar";
import { TagsBar } from "@/components/feed/TagsBar";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("for you");
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPosts();
      fetchPopularTags();
    }
  }, [session, activeTag]);

  const fetchPopularTags = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("tags")
        .not("tags", "eq", "{}");

      if (error) throw error;

      const allTags = data.flatMap((post) => post.tags);
      const tagCounts = allTags.reduce((acc: any, tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {});

      const sortedTags = Object.entries(tagCounts)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      setPopularTags(sortedTags);
    } catch (error: any) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            avatar_url,
            bio
          ),
          likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .order("created_at", { ascending: false });

      if (activeTag !== "for you") {
        query = query.contains("tags", [activeTag]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching posts",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: existingLike } = await supabase
        .from("likes")
        .select()
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (existingLike) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: user.id });
      }

      fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="ml-64">
        <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 right-0 left-64 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">ShareWhirl</h1>
            <CreatePostDialog />
          </div>
          <TagsBar
            tags={popularTags}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
          />
        </header>

        <div className="container mx-auto px-4 pt-32 pb-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p>Loading posts...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={session?.user?.id}
                  onLike={handleLike}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;