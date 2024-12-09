import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostList } from "@/components/profile/PostList";
import { useProfileData, useProfilePosts } from "@/hooks/useProfileData";
import { Loader } from "lucide-react";
import { Sidebar } from "@/components/feed/Sidebar";

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  const { data: profile, isLoading: isProfileLoading } = useProfileData(username);
  const { data: posts = [], isLoading: isPostsLoading } = useProfilePosts(profile?.user_id);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          setCurrentUser(profile);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsSessionLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        fetchCurrentUser();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        navigate('/');
      }
    });

    fetchCurrentUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isSessionLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <div className="flex justify-center items-center min-h-screen">
            <Loader className="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64">
          <div className="flex justify-center items-center min-h-screen">
            <p>Profile not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <ProfileHeader
            profile={profile}
            isOwnProfile={currentUser?.user_id === profile?.user_id}
            onEditClick={() => setIsEditOpen(true)}
          />

          <div className="mt-8 border-t border-border/40">
            {isPostsLoading ? (
              <div className="flex justify-center py-8">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <PostList
                posts={posts}
                currentUserId={currentUser?.user_id}
                onLike={handleLike}
              />
            )}
          </div>

          <EditProfileDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            profile={profile}
            onProfileUpdate={(updatedProfile) => {
              setIsEditOpen(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}