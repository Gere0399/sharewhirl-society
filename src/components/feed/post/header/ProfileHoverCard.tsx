import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Link } from "react-router-dom";
import { ProfileHoverCardContent } from "./ProfileHoverCardContent";
import { getInitials } from "@/utils/stringUtils";
import { useFollowUser } from "@/hooks/useFollowUser";

interface ProfileHoverCardProps {
  profile: {
    username: string;
    avatar_url?: string;
    bio?: string;
    user_id: string;
    followers_count?: number;
  };
  currentUserId?: string;
  showAvatar?: boolean;
}

export function ProfileHoverCard({ profile, currentUserId, showAvatar = true }: ProfileHoverCardProps) {
  const { isFollowing, followersCount, handleFollow } = useFollowUser(profile.user_id, currentUserId);

  const content = showAvatar ? (
    <Avatar className="h-8 w-8">
      <AvatarImage src={profile.avatar_url} alt={profile.username} />
      <AvatarFallback>{getInitials(profile.username)}</AvatarFallback>
    </Avatar>
  ) : (
    <span className="hover:underline">@{profile.username}</span>
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link 
          to={`/profile/${profile.username}`}
          className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </Link>
      </HoverCardTrigger>
      
      <HoverCardContent 
        className="w-80" 
        onClick={(e) => e.stopPropagation()}
        align="start"
        side="bottom"
      >
        <ProfileHoverCardContent 
          profile={profile}
          currentUserId={currentUserId}
          isFollowing={isFollowing}
          followersCount={followersCount}
          onFollow={handleFollow}
        />
      </HoverCardContent>
    </HoverCard>
  );
}