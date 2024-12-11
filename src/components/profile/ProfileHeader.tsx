import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EditProfileDialog } from "./EditProfileDialog";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => Promise<void>;
}

export function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollowToggle }: ProfileHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const handleFollowToggle = async () => {
    setLoading(true);
    await onFollowToggle();
    setLoading(false);
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    // Update the profile data in the parent component
    Object.assign(profile, updatedProfile);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.bio && (
              <p className="text-sm text-muted-foreground max-w-md">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{profile.followers_count || 0} followers</span>
              {isOwnProfile ? (
                <Button 
                  onClick={() => setIsEditProfileOpen(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              ) : (
                <Button 
                  onClick={handleFollowToggle} 
                  disabled={loading}
                  variant={isFollowing ? "secondary" : "default"}
                  size="sm"
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Separator />

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}