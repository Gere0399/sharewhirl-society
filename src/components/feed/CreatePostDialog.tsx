import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CreatePostForm } from "./post/create/CreatePostForm";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ isOpen, onOpenChange }: CreatePostDialogProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async ({
    title,
    tags,
    isAiGenerated,
    file,
  }: {
    title: string;
    tags: string[];
    isAiGenerated: boolean;
    file: File | null;
  }) => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please fill in the title",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) throw new Error("Profile not found");

      let mediaUrl = null;
      let mediaType = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        if (file.type.startsWith("image/")) {
          mediaType = "image";
        } else if (file.type.startsWith("video/")) {
          mediaType = "video";
        } else if (file.type.startsWith("audio/")) {
          mediaType = "audio";
        }

        const { error: uploadError, data } = await supabase.storage
          .from("media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        mediaUrl = data.path;
      }

      const { error: postError } = await supabase.from("posts").insert({
        title,
        content: title,
        media_url: mediaUrl,
        media_type: mediaType,
        user_id: profile.user_id,
        tags,
        is_ai_generated: isAiGenerated
      });

      if (postError) throw postError;

      toast({
        title: "Success",
        description: "Post created successfully",
      });
      
      onOpenChange(false);
    } catch (error: any) {
      console.error("Post creation error:", error);
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
          <DialogDescription>
            Share your thoughts, images, or videos with the community.
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm onSubmit={handleSubmit} uploading={uploading} />
      </DialogContent>
    </Dialog>
  );
}