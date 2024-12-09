import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/feed/PostCard";
import { useToast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setCurrentUser(profile);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!username) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .single();

        if (profileError) throw profileError;
        if (!profileData) {
          navigate('/');
          return;
        }

        setProfile(profileData);

        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!inner (
              username,
              avatar_url
            ),
            likes (
              user_id
            )
          `)
          .eq('user_id', profileData.user_id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      } catch (error: any) {
        toast({
          title: "Error fetching profile",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate, toast]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const { data: existingLike } = await supabase
        .from("likes")
        .select()
        .eq("post_id", postId)
        .eq("user_id", currentUser.user_id)
        .single();

      if (existingLike) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.user_id);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: currentUser.user_id });
      }

      // Refresh posts
      const { data: updatedPosts } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!inner (
            username,
            avatar_url
          ),
          likes (
            user_id
          )
        `)
        .eq('user_id', profile.user_id)
        .order('created_at', { ascending: false });

      setPosts(updatedPosts || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile...</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.user_id === profile?.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onEditClick={() => setIsEditOpen(true)}
      />

      <div className="grid gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUserId={currentUser?.user_id}
            onLike={handleLike}
          />
        ))}
      </div>

      <EditProfileDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        profile={profile}
        onProfileUpdate={(updatedProfile) => {
          setProfile(updatedProfile);
          setIsEditOpen(false);
        }}
      />
    </div>
  );
}