import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { getInitials } from "@/utils/stringUtils";

interface ProfileHoverCardContentProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
  };
  currentUserId?: string;
  isFollowing: boolean;
  followersCount: number;
  onFollow: (e: React.MouseEvent) => void;
}

export function ProfileHoverCardContent({ 
  profile, 
  currentUserId, 
  isFollowing, 
  followersCount,
  onFollow 
}: ProfileHoverCardContentProps) {
  return (
    <div>
      <div className="flex justify-between space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
        </Avatar>
        {currentUserId && currentUserId !== profile.user_id && (
          <Button 
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            onClick={onFollow}
            className="gap-2"
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-4 w-4" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
      <div className="space-y-1 mt-3">
        <h4 className="text-sm font-semibold">@{profile.username}</h4>
        {profile.bio && (
          <p className="text-sm text-muted-foreground">
            {profile.bio}
          </p>
        )}
        <p className="text-sm text-white">
          {followersCount} followers
        </p>
      </div>
    </div>
  );
}