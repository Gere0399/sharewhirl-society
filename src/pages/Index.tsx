import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Plus, Video, Music } from "lucide-react";
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
        // Check if profile exists for the user
        checkAndCreateProfile(session?.user?.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (userId: string | undefined) => {
    if (!userId) return;

    try {
      // Check if profile exists
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no profile exists, create one
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
          profiles:profiles(username, avatar_url)
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

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case "image":
        return <Image className="w-6 h-6" />;
      case "video":
        return <Video className="w-6 h-6" />;
      case "audio":
        return <Music className="w-6 h-6" />;
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: "#FF0000",
                      brandAccent: "#FF3333",
                    },
                  },
                },
              }}
              providers={["google"]}
              theme="dark"
              redirectTo={`${window.location.origin}/`}
              localization={{
                variables: {
                  sign_in: {
                    email_input_placeholder: "Your email address",
                    password_input_placeholder: "Your password",
                    email_label: "Email address",
                    password_label: "Password",
                    button_label: "Sign in",
                    loading_button_label: "Signing in ...",
                    social_provider_text: "Sign in with {{provider}}",
                    link_text: "Already have an account? Sign in",
                  },
                  sign_up: {
                    email_input_placeholder: "Your email address",
                    password_input_placeholder: "Create a password",
                    email_label: "Email address",
                    password_label: "Create a password",
                    button_label: "Sign up",
                    loading_button_label: "Signing up ...",
                    social_provider_text: "Sign up with {{provider}}",
                    link_text: "Don't have an account? Sign up",
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/40 backdrop-blur-sm fixed top-0 w-full z-10">
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

      <main className="container mx-auto px-4 pt-20 pb-8">
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Loading posts...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
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
                  {getMediaIcon(post.media_type)}
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
      </main>
    </div>
  );
};

export default Index;