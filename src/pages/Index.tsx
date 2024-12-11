import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sidebar } from "@/components/feed/Sidebar";
import { TagsBar } from "@/components/feed/TagsBar";
import { PostCard } from "@/components/feed/PostCard";
import { SearchBar } from "@/components/feed/SearchBar";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("for you");
  const [userTags, setUserTags] = useState<string[]>(() => {
    const savedTags = localStorage.getItem('userTags');
    return savedTags ? JSON.parse(savedTags) : [];
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

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
    }
  }, [session, activeTag]);

  const handleTagSelect = (tag: string) => {
    setActiveTag(tag);
    if (!userTags.includes(tag) && tag !== "for you") {
      const newTags = [...userTags, tag];
      setUserTags(newTags);
      localStorage.setItem('userTags', JSON.stringify(newTags));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = userTags.filter(tag => tag !== tagToRemove);
    setUserTags(newTags);
    localStorage.setItem('userTags', JSON.stringify(newTags));
    if (activeTag === tagToRemove) {
      setActiveTag("for you");
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("posts")
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
        .order("created_at", { ascending: false });

      if (activeTag !== "for you") {
        query = query.or(`tags.cs.{${activeTag}},title.ilike.%${activeTag}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error("Error in fetchPosts:", error);
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

      const { data: existingLike, error: likeCheckError } = await supabase
        .from("likes")
        .select("*")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .single();

      if (likeCheckError && likeCheckError.code !== 'PGRST116') {
        throw likeCheckError;
      }

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;
      } else {
        const { error: insertError } = await supabase
          .from("likes")
          .insert([{ post_id: postId, user_id: user.id }]);

        if (insertError) throw insertError;
      }

      await fetchPosts();
    } catch (error: any) {
      console.error("Error handling like:", error);
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
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-16">
        <header className="fixed top-0 right-0 left-16 z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col gap-2 max-w-2xl mx-auto">
              <SearchBar />
              <TagsBar
                tags={userTags}
                activeTag={activeTag}
                onTagSelect={handleTagSelect}
                onTagRemove={handleRemoveTag}
              />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
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
        </div>
      </main>
    </div>
  );
};

export default Index;