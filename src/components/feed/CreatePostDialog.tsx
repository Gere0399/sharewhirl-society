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
import { useIsMobile } from "@/hooks/use-mobile";

interface CreatePostDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ isOpen, onOpenChange }: CreatePostDialogProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmit = async ({
    title,
    tags,
    isAiGenerated,
    file,
    thumbnail,
  }: {
    title: string;
    tags: string[];
    isAiGenerated: boolean;
    file: File | null;
    thumbnail?: File | null;
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
      let thumbnailUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        if (file.type.startsWith("image/")) {
          mediaType = "image";
        } else if (file.type.startsWith("video/")) {
          mediaType = "video";
          
          if (!thumbnail) {
            throw new Error("Thumbnail is required for video uploads");
          }
          
          const thumbnailExt = thumbnail.name.split(".").pop();
          const thumbnailName = `${Math.random()}.${thumbnailExt}`;
          
          const { error: thumbnailUploadError, data: thumbnailData } = await supabase.storage
            .from("media")
            .upload(thumbnailName, thumbnail);

          if (thumbnailUploadError) throw thumbnailUploadError;
          thumbnailUrl = thumbnailData.path;
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
        thumbnail_url: thumbnailUrl,
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
      <DialogContent 
        className={`${
          isMobile 
            ? 'w-[100vw] h-[100dvh] max-w-none max-h-none rounded-none m-0 p-4 fixed inset-0' 
            : 'max-w-2xl'
        }`}
      >
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