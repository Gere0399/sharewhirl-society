import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: any;
  currentUserId?: string;
  onLike: (postId: string) => void;
}

export function PostCard({ post, currentUserId, onLike }: PostCardProps) {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`
      );
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="flex flex-row items-center gap-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to={`/profile/${post.profiles?.username}`} className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold">{post.profiles?.username}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex flex-col gap-2">
              <Avatar className="h-16 w-16">
                <AvatarImage src={post.profiles?.avatar_url} />
                <AvatarFallback>{post.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <h4 className="text-lg font-semibold">{post.profiles?.username}</h4>
              <p className="text-sm text-muted-foreground">{post.profiles?.bio}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
        
        {post.is_ai_generated && (
          <Badge variant="secondary" className="ml-auto">
            AI Generated
          </Badge>
        )}
        
        {post.reposted_from_user_id && (
          <Badge variant="outline" className="ml-auto">
            Reposted from @{post.reposted_from_username}
          </Badge>
        )}
      </CardHeader>

      <CardContent>
        <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        <p className="text-muted-foreground mb-4">{post.content}</p>
        
        {post.media_url && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {post.media_type === "image" && (
              <img
                src={post.media_url}
                alt={post.title}
                className="object-cover w-full h-full"
              />
            )}
            {post.media_type === "video" && (
              <video
                src={post.media_url}
                controls
                className="w-full h-full"
              />
            )}
            {post.media_type === "audio" && (
              <audio src={post.media_url} controls className="w-full mt-4" />
            )}
          </div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className={post.likes?.some((like: any) => like.user_id === currentUserId) ? "text-red-500" : ""}
          >
            <Heart className="w-4 h-4 mr-1" />
            {post.likes_count || 0}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCommentsOpen(true)}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            {post.comments_count || 0}
          </Button>
          
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4 mr-1" />
            Repost
          </Button>
          
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </CardFooter>

      <Dialog open={isCommentsOpen} onOpenChange={setIsCommentsOpen}>
        <DialogContent className="max-w-2xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1">
            {/* Comments component will be implemented separately */}
            <p className="text-muted-foreground text-center py-8">
              Comments feature coming soon
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}