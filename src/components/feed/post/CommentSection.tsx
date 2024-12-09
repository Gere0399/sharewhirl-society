import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";

interface CommentSectionProps {
  postId: string;
  currentUserId?: string;
}

export function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,audio/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim() && !file) {
      toast({
        title: "Error",
        description: "Please enter a comment or attach a file",
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
        content: newComment,
        post_id: postId,
        user_id: currentUserId,
        media_url: mediaUrl,
        media_type: mediaType,
      });

      if (error) throw error;

      setNewComment("");
      setFile(null);
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
      <div className="flex gap-4 p-4 border-b">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1"
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleFileSelect}
            className="h-10 w-10"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={loading}
          >
            Post
          </Button>
        </div>
      </div>
      
      {file && (
        <div className="px-4 py-2 text-sm text-muted-foreground">
          Selected file: {file.name}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={comment.profiles?.avatar_url} />
                <AvatarFallback>
                  {comment.profiles?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">
                  {comment.profiles?.username}
                </div>
                <p className="text-sm text-muted-foreground">
                  {comment.content}
                </p>
                {comment.media_url && (
                  <div className="mt-2">
                    {comment.media_type === "image" ? (
                      <img
                        src={supabase.storage
                          .from("media")
                          .getPublicUrl(comment.media_url).data.publicUrl}
                        alt="Comment attachment"
                        className="rounded-lg max-w-sm"
                      />
                    ) : comment.media_type === "audio" ? (
                      <audio
                        src={supabase.storage
                          .from("media")
                          .getPublicUrl(comment.media_url).data.publicUrl}
                        controls
                        className="w-full"
                      />
                    ) : null}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(comment.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}