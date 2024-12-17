import { useState } from "react";
import { useParams } from "react-router-dom";
import { Sidebar } from "@/components/feed/Sidebar";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PostList } from "@/components/profile/PostList";
import { CreatePostDialog } from "@/components/feed/CreatePostDialog";
import { useProfileData, useProfilePosts } from "@/hooks/useProfileData";
import { useAuth } from "@/hooks/useAuth";
import { useFollowUser } from "@/hooks/useFollowUser";

export default function Profile() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  
  const { data: profile, isLoading: isProfileLoading } = useProfileData(username);
  const { data: posts = [], isLoading: isPostsLoading } = useProfilePosts(profile?.user_id);
  
  const { isFollowing, toggleFollow } = useFollowUser(profile?.user_id);
  
  if (isProfileLoading || !profile) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
        <main className="flex-1 border-l border-r border-border/10 md:ml-16">
          <div className="container max-w-3xl py-4 md:py-8">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.user_id;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 border-l border-r border-border/10 md:ml-16">
        <div className="container max-w-3xl py-4 md:py-8">
          <ProfileHeader
            profile={profile}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            onFollowToggle={toggleFollow}
          />
          <PostList
            posts={posts}
            currentUserId={currentUser?.id}
          />
        </div>
      </main>
      <CreatePostDialog isOpen={isCreatePostOpen} onOpenChange={setIsCreatePostOpen} />
    </div>
  );
}