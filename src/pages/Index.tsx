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
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";

const Index = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState("for you");
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
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

      const channel = supabase
        .channel('public:posts')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts'
          },
          () => {
            fetchPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session, activeTag]);

  const handleTagSelect = (tag: string) => {
    setActiveTag(tag);
    if (!userTags.includes(tag) && tag !== "for you" && tag !== "following") {
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
            created_at,
            user_id,
            followers_count
          ),
          likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .order("created_at", { ascending: false });

      if (activeTag === "following" && session?.user?.id) {
        const { data: followingUsers } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", session.user.id);

        const followingIds = followingUsers?.map(follow => follow.following_id) || [];
        
        if (followingIds.length > 0) {
          query = query.in("user_id", followingIds);
        } else {
          setPosts([]);
          setLoading(false);
          return;
        }
      } else if (activeTag !== "for you") {
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

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <header className={`fixed top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm ${isMobile ? 'right-0 left-0' : 'right-0 left-16'}`}>
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
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

        <CreatePostDialog 
          isOpen={isCreatePostOpen} 
          onOpenChange={setIsCreatePostOpen} 
        />

        <div className="container mx-auto px-4 pt-36 pb-8">
          <div className="max-w-2xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activeTag === "following" ? "No posts from people you follow" : "No posts found"}
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    currentUserId={session?.user?.id}
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
