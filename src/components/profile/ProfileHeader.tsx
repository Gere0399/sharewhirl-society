import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, UserPlus, UserMinus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onEditClick: () => void;
}

export function ProfileHeader({ profile, isOwnProfile, onEditClick }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(profile?.followers_count || 0);
  const { toast } = useToast();

  useEffect(() => {
    const checkIfFollowing = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('follows')
          .select('*')
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking follow status:', error);
          return;
        }

        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error in checkIfFollowing:', error);
      }
    };

    checkIfFollowing();

    // Subscribe to follows changes
    const channel = supabase.channel('follows_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${profile.user_id}`,
        },
        (payload) => {
          console.log('Follows change received:', payload);
          if (payload.eventType === 'INSERT') {
            console.log('Follow added, updating count from', followersCount, 'to', followersCount + 1);
            setFollowersCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            console.log('Follow removed, updating count from', followersCount, 'to', followersCount - 1);
            setFollowersCount(prev => prev - 1);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [profile.user_id]);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to follow users",
          variant: "destructive",
        });
        return;
      }

      console.log('Current follow status:', isFollowing);
      console.log('Attempting to follow/unfollow user:', profile.user_id);

      if (isFollowing) {
        const { error: deleteError } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.user_id);

        if (deleteError) throw deleteError;
        console.log('Successfully unfollowed');
        setIsFollowing(false);
      } else {
        const { error: insertError } = await supabase
          .from('follows')
          .insert([{
            follower_id: user.id,
            following_id: profile.user_id,
          }]);

        if (insertError) throw insertError;
        console.log('Successfully followed');
        setIsFollowing(true);
      }

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing ? `Unfollowed ${profile.username}` : `Now following ${profile.username}`,
      });
    } catch (error: any) {
      console.error('Error in handleFollow:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader className="relative">
        {isOwnProfile ? (
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 right-4"
            onClick={onEditClick}
          >
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            className="absolute top-4 right-4"
            onClick={handleFollow}
            disabled={isLoading}
          >
            {isFollowing ? (
              <>
                <UserMinus className="h-4 w-4 mr-2" />
                Unfollow
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Follow
              </>
            )}
          </Button>
        )}
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h1 className="text-2xl font-bold">{profile?.username}</h1>
            <p className="text-muted-foreground mt-1">{followersCount} followers</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {profile?.bio && (
          <p className="text-center text-muted-foreground">{profile.bio}</p>
        )}
      </CardContent>
    </Card>
  );
}