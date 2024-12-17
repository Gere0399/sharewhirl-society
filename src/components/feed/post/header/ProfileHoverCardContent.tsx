import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { getInitials } from "@/utils/stringUtils";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/profile/${profile.username}`);
  };

  return (
    <div className="flex flex-col gap-4 cursor-pointer" onClick={handleProfileClick}>
      <div className="flex justify-between items-start">
        <Avatar className="h-12 w-12">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
        </Avatar>
        {currentUserId && currentUserId !== profile.user_id && (
          <Button 
            variant={isFollowing ? "secondary" : "default"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onFollow(e);
            }}
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
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">@{profile.username}</h4>
        {profile.bio && (
          <p className="text-sm text-muted-foreground">
            {profile.bio}
          </p>
        )}
        <div className="flex items-center text-sm text-muted-foreground">
          <span>{followersCount} followers</span>
        </div>
      </div>
    </div>
  );
}