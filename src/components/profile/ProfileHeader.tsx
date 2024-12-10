import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => Promise<void>;
}

export function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollowToggle }: ProfileHeaderProps) {
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    await onFollowToggle();
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.avatar_url} />
          <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="ml-4">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          <p className="text-sm text-muted-foreground">{profile.bio}</p>
        </div>
      </div>
      {!isOwnProfile && (
        <Button onClick={handleFollowToggle} disabled={loading}>
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}
    </div>
  );
}
