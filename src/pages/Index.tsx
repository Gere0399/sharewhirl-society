import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { Sidebar } from "@/components/feed/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Repeat, Plus, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
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
      fetchTags();
    }
  }, [session, selectedTags]);

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("tags");
      
      if (error) throw error;
      
      const uniqueTags = [...new Set(data.flatMap(post => post.tags || []))];
      setAllTags(uniqueTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from("posts")
        .select(`
          *,
          profiles:profiles(username, avatar_url, bio),
          likes(user_id),
          comments(id)
        `)
        .order("created_at", { ascending: false });

      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }

      const { data, error } = await query;

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

  const handleLike = async (postId) => {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select()
        .eq('post_id', postId)
        .eq('user_id', session.user.id)
        .single();

      if (existingLike) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', session.user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: session.user.id });
      }

      await fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    }
  };

  const handleRepost = async (post) => {
    try {
      await supabase
        .from('posts')
        .insert({
          content: post.content,
          title: post.title,
          media_url: post.media_url,
          media_type: post.media_type,
          user_id: session.user.id,
          reposted_from_id: post.id,
          reposted_from_user_id: post.user_id,
          tags: post.tags,
        });

      toast({
        title: "Success",
        description: "Post reposted successfully",
      });
      
      await fetchPosts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to repost",
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
          <div className="mb-6 flex gap-2 flex-wrap">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTags(prev =>
                    prev.includes(tag)
                      ? prev.filter(t => t !== tag)
                      : [...prev, tag]
                  );
                }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p>Loading posts...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer">
                          <Avatar>
                            {post.profiles?.avatar_url && (
                              <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.username} />
                            )}
                            <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {post.profiles?.username || "Anonymous"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {new Date(post.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex justify-between space-x-4">
                          <Avatar>
                            {post.profiles?.avatar_url && (
                              <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.username} />
                            )}
                            <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold">{post.profiles?.username}</h4>
                            <p className="text-sm text-muted-foreground">
                              {post.profiles?.bio || "No bio available"}
                            </p>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  </CardHeader>
                  <CardContent>
                    {post.reposted_from_id && (
                      <div className="mb-2 text-sm text-muted-foreground">
                        <Repeat className="w-4 h-4 inline mr-1" />
                        Reposted
                      </div>
                    )}
                    <h4 className="text-lg font-semibold mb-2">{post.title}</h4>
                    <p className="text-muted-foreground">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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
                    <div className="mt-4 flex gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            post.likes?.some(like => like.user_id === session?.user?.id)
                              ? "fill-current text-red-500"
                              : ""
                          }`}
                        />
                        {post.likes_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => navigate(`/post/${post.id}`)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {post.comments_count || 0}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleRepost(post)}
                      >
                        <Repeat className="w-4 h-4" />
                        Repost
                      </Button>
                    </div>
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