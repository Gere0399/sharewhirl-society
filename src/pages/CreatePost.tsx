import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Image, Video, Music, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio" | "none">("none");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (type: "image" | "video" | "audio") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : type === "video" ? "video/*" : "audio/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const selectedFile = target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        setMediaType(type);
      }
    };
    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      let mediaUrl = null;

      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError, data } = await supabase.storage
          .from("media")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        mediaUrl = data.path;
      }

      const { error } = await supabase.from("posts").insert({
        title,
        content,
        media_url: mediaUrl,
        media_type: mediaType,
        user_id: user.id
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post created successfully",
      });
      navigate("/");
    } catch (error: any) {
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Feed
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Post Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mb-4"
                />
                <Textarea
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileSelect("image")}
                >
                  <Image className="w-4 h-4 mr-2" />
                  Add Image
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileSelect("video")}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Add Video
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleFileSelect("audio")}
                >
                  <Music className="w-4 h-4 mr-2" />
                  Add Audio
                </Button>
              </div>

              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected file: {file.name}
                </p>
              )}

              <Button type="submit" disabled={uploading} className="w-full">
                {uploading ? "Creating Post..." : "Create Post"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreatePost;