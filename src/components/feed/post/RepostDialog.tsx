import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RepostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: any;
  onRepost?: () => void;
}

export function RepostDialog({ isOpen, onClose, post, onRepost }: RepostDialogProps) {
  const [title, setTitle] = useState(post.title);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleRepost = async () => {
    try {
      setIsSubmitting(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to repost",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('posts')
        .insert({
          title,
          content: post.content,
          user_id: user.id,
          media_url: post.media_url,
          media_type: post.media_type,
          tags: post.tags,
          reposted_from_id: post.id,
          reposted_from_user_id: post.user_id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post has been reposted!",
      });
      
      onRepost?.();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Repost this content</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Input
              placeholder="Edit title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRepost} disabled={isSubmitting}>
              {isSubmitting ? "Reposting..." : "Repost"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}