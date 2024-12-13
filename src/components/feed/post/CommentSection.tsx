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
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();

    // Subscribe to realtime updates for comments and likes
    const commentsChannel = supabase
      .channel('comments-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    const likesChannel = supabase
      .channel('comments-likes-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments_likes'
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [postId]);

  const fetchComments = async () => {
    try {
      console.log("Fetching comments for post:", postId);
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select(`
          *,
          comments_likes (
            user_id
          )
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch profiles for the comments
      const userIds = commentsData.map(comment => comment.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Combine comments with profiles and check if liked by current user
      const commentsWithProfiles = commentsData.map(comment => ({
        ...comment,
        profiles: profilesData.find(profile => profile.user_id === comment.user_id),
        is_liked: comment.comments_likes.some((like: any) => like.user_id === currentUserId)
      }));

      console.log("Fetched comments with profiles:", commentsWithProfiles);
      setComments(commentsWithProfiles);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error fetching comments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async (commentId: string) => {
    try {
      const { data: existingLike, error: likeError } = await supabase
        .from('comments_likes')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', currentUserId)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results case

      if (likeError && likeError.code !== 'PGRST116') {
        throw likeError;
      }

      if (existingLike) {
        await supabase
          .from('comments_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', currentUserId);
      } else {
        await supabase
          .from('comments_likes')
          .insert({
            comment_id: commentId,
            user_id: currentUserId
          });
      }

      // No need to manually update state as we're subscribed to changes
    } catch (error: any) {
      console.error("Error liking comment:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (content: string, file: File | null, parentCommentId?: string) => {
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
        parent_comment_id: parentCommentId || null,
      });

      if (error) throw error;
      
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

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => 
      prev.includes(commentId) 
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <CommentInput onSubmit={(content, file) => handleSubmit(content, file)} loading={loading} />
      </div>
      <ScrollArea className="h-[600px] pr-4">
        <CommentList 
          comments={comments} 
          currentUserId={currentUserId}
          onCommentSubmit={handleSubmit}
          onDelete={handleDelete}
          onLike={handleLike}
          expandedComments={expandedComments}
          onToggleReplies={toggleReplies}
        />
      </ScrollArea>
    </div>
  );
}
