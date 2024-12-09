import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { CommentInput } from "./comment/CommentInput";
import { CommentList } from "./comment/CommentList";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      console.log("Fetching comments for post:", postId);
      const { data, error } = await supabase
        .from("comments")
        .select(`
          id,
          content,
          created_at,
          media_url,
          media_type,
          user_id,
          profiles!comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log("Fetched comments:", data);
      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (content: string, file: File | null) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      let mediaUrl = null;
      let mediaType = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        if (file.type.startsWith("image/")) {
          mediaType = "image";
        } else if (file.type.startsWith("audio/")) {
          mediaType = "audio";
        }

        const { error: uploadError, data } = await supabase.storage
          .from("media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        mediaUrl = data.path;
      }

      const { error } = await supabase.from("comments").insert({
        content,
        post_id: postId,
        user_id: currentUserId,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      fetchComments();
      
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error: any) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <CommentInput onSubmit={handleSubmit} loading={loading} />
      <ScrollArea className="flex-1">
        <CommentList comments={comments} />
      </ScrollArea>
    </div>
  );
}