import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/feed/Sidebar";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { PostCard } from "@/components/feed/post/PostCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostView() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (
              username,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error: any) {
        console.error('Error fetching post:', error);
        toast({
          title: "Error",
          description: "Failed to load post",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPost();
    }
  }, [id, toast]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <div className="container max-w-3xl py-4 md:py-8">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : post ? (
            <PostCard post={post} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Post not found</p>
            </div>
          )}
        </div>
      </main>
      <CreatePostDialog isOpen={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </div>
  );
}