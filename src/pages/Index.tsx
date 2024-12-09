import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sidebar } from "@/components/feed/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        checkAndCreateProfile(session?.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (userId) => {
    if (!userId) return;

    try {
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            username: `user_${userId.substring(0, 6)}`,
          });

        if (insertError) throw insertError;

        toast({
          title: "Welcome!",
          description: "Your profile has been created successfully.",
        });
      }
    } catch (error) {
      console.error('Error managing profile:', error);
      toast({
        title: "Error",
        description: "There was an error setting up your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  const fetchPosts = async () => {
    try {
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
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
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
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="ml-64">
        <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 right-0 left-64 z-10">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <h1 className="text-xl font-bold">ShareWhirl</h1>
            <div className="flex gap-4 items-center">
              <Button
                onClick={() => navigate("/create")}
                className="gap-2"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
              <Button
                variant="ghost"
                onClick={() => supabase.auth.signOut()}
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 pt-20 pb-8">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p>Loading posts...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      {post.profiles?.avatar_url && (
                        <img
                          src={post.profiles.avatar_url}
                          alt={post.profiles.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {post.profiles?.username || "Anonymous"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
                    <p className="text-muted-foreground">{post.content}</p>
                    {post.media_url && (
                      <div className="mt-4">
                        {post.media_type === "image" && (
                          <img
                            src={post.media_url}
                            alt={post.title}
                            className="rounded-lg max-h-96 w-full object-cover"
                          />
                        )}
                        {post.media_type === "video" && (
                          <video
                            src={post.media_url}
                            controls
                            className="rounded-lg w-full"
                          />
                        )}
                        {post.media_type === "audio" && (
                          <audio src={post.media_url} controls className="w-full" />
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;