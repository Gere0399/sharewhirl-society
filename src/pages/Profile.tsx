import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/feed/Sidebar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostList } from "@/components/profile/PostList";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";

const Profile = () => {
  const { username } = useParams();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username, session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError) throw profileError;
      if (!profileData) throw new Error("Profile not found");

      setProfile(profileData);

      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_fkey (
            username,
            avatar_url
          ),
          likes (
            user_id
          ),
          comments (
            id
          )
        `)
        .eq("user_id", profileData.user_id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;
      setPosts(posts || []);

      if (session?.user?.id) {
        const { data: followData, error: followError } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", session.user.id)
          .eq("following_id", profileData.user_id)
          .single();

        if (followError && followError.code !== "PGRST116") throw followError;
        setIsFollowing(!!followData);
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!session) {
      toast({
        title: "Error",
        description: "You must be logged in to follow users",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", session.user.id)
          .eq("following_id", profile.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("follows").insert({
          follower_id: session.user.id,
          following_id: profile.user_id,
        });

        if (error) throw error;
      }

      setIsFollowing(!isFollowing);
    } catch (error: any) {
      console.error("Error toggling follow:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isOwnProfile = session?.user?.id === profile?.user_id;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 flex justify-center">
        <div className="w-full max-w-2xl px-4 py-8 pb-20 md:pb-8 md:px-0">
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <Loader className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              {error}
            </div>
          ) : (
            <>
              <ProfileHeader
                profile={profile}
                isOwnProfile={isOwnProfile}
                isFollowing={isFollowing}
                onFollowToggle={handleFollowToggle}
              />
              <PostList
                posts={posts}
                currentUserId={session?.user?.id}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
