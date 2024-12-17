import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EditProfileDialog } from "./EditProfileDialog";
import { SidebarOptionsMenu } from "../feed/sidebar/SidebarOptionsMenu";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  isFollowing: boolean;
  onFollowToggle: () => Promise<void>;
}

export function ProfileHeader({ profile, isOwnProfile, isFollowing, onFollowToggle }: ProfileHeaderProps) {
  const [loading, setLoading] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile.followers_count || 0);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Subscribe to real-time updates for followers count
    const channel = supabase
      .channel(`profile-${profile.user_id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${profile.user_id}`
        },
        (payload: any) => {
          if (payload.new) {
            setFollowersCount(payload.new.followers_count || 0);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile.user_id]);

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    await onFollowToggle();
    setLoading(false);
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    Object.assign(profile, updatedProfile);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1 flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <>
                    <Button 
                      onClick={() => setIsEditProfileOpen(true)}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      Edit Profile
                    </Button>
                    {isMobile && (
                      <div className="h-8 flex items-center">
                        <SidebarOptionsMenu />
                      </div>
                    )}
                  </>
                ) : (
                  <Button 
                    onClick={handleFollowToggle} 
                    disabled={loading}
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    className="h-8"
                  >
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
            {profile.bio && (
              <p className="text-sm text-muted-foreground max-w-md">{profile.bio}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{followersCount} followers</span>
            </div>
          </div>
        </div>
      </div>
      <Separator className="bg-border/10" />

      <EditProfileDialog
        open={isEditProfileOpen}
        onOpenChange={setIsEditProfileOpen}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
}