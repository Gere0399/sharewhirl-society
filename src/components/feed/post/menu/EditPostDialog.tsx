import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TagInput } from "../../post/create/TagInput";

interface EditPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialTitle: string;
  initialContent: string;
  initialTags: string[];
  initialIsAiGenerated: boolean;
}

export function EditPostDialog({
  isOpen,
  onClose,
  postId,
  initialTitle,
  initialContent,
  initialTags,
  initialIsAiGenerated,
}: EditPostDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content] = useState(initialContent);
  const [tags, setTags] = useState(initialTags);
  const [isAiGenerated, setIsAiGenerated] = useState(initialIsAiGenerated);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('posts')
        .update({
          title,
          tags,
          is_ai_generated: isAiGenerated,
          updated_at: new Date().toISOString(),
        })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      onClose();
    } catch (error: any) {
      console.error('Error updating post:', error);
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title"
            />
          </div>

          <TagInput tags={tags} setTags={setTags} />

          <div className="flex items-center space-x-2">
            <Switch
              id="ai-generated"
              checked={isAiGenerated}
              onCheckedChange={setIsAiGenerated}
            />
            <Label htmlFor="ai-generated">AI Generated Content</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}