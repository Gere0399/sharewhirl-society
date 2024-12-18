import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useAuth } from "@/hooks/useAuth";

interface NotificationActorsDialogProps {
  actors: Tables<"profiles">[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationActorsDialog({
  actors,
  isOpen,
  onOpenChange,
}: NotificationActorsDialogProps) {
  const { session } = useAuth();
  const currentUserId = session?.user?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>People who interacted</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {actors.map((actor) => {
            const { isFollowing, handleFollow } = useFollowUser(actor.user_id, currentUserId);
            
            return (
              <div key={actor.user_id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link to={`/profile/${actor.username}`}>
                    <Avatar>
                      <AvatarImage src={actor.avatar_url || ""} />
                      <AvatarFallback>
                        {actor.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link
                      to={`/profile/${actor.username}`}
                      className="font-semibold hover:underline"
                    >
                      {actor.username}
                    </Link>
                    {actor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {actor.bio}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {actor.followers_count} followers
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFollow}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}