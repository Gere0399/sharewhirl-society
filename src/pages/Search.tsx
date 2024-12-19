import { useState } from "react";
import { Sidebar } from "@/components/feed/Sidebar";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/components/feed/search/useSearch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useFollowUser } from "@/hooks/useFollowUser";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Search() {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { searchResults, isLoading } = useSearch(search);
  const { user } = useAuth();

  const profiles = searchResults
    .filter(result => result.type === "profile")
    .slice(0, search.split(" ").length > 2 ? 4 : 10);

  const posts = searchResults
    .filter(result => result.type === "post")
    .slice(0, search.split(" ").length > 2 ? 10 : 4);

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'} overflow-x-hidden`}>
        <header className={`fixed top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm ${isMobile ? 'right-0 left-0' : 'right-0 left-16'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2 max-w-2xl mx-auto">
              <Input
                type="text"
                placeholder="Search posts and profiles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-secondary/50 border-0 focus-visible:ring-0"
              />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {profiles.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Profiles</h2>
                    <Separator />
                    {profiles.map((profile) => {
                      const { isFollowing, handleFollow } = useFollowUser(profile.user_id, user?.id);
                      return (
                        <div key={profile.id} className="flex items-start justify-between p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={profile.avatar_url} />
                              <AvatarFallback>{profile.username?.[0]?.toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{profile.username}</h3>
                                <span className="text-sm text-muted-foreground">
                                  {profile.followers_count || 0} followers
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {profile.bio || "No bio available"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleFollow}
                          >
                            {isFollowing ? "Unfollow" : "Follow"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Posts</h2>
                    <Separator />
                    {posts.map((post) => (
                      <div key={post.id} className="flex gap-4 p-4 bg-card rounded-lg border hover:bg-accent/50 transition-colors">
                        {post.media_url && post.media_type === 'image' && (
                          <div className="flex-shrink-0 w-24 h-24">
                            <img
                              src={post.media_url}
                              alt={post.title}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium line-clamp-1">{post.title}</h3>
                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {post.tags.map((tag: string) => (
                                    <span
                                      key={tag}
                                      className="text-xs px-2 py-0.5 bg-secondary rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/post/${post.id}`)}
                            >
                              Watch
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchResults.length === 0 && search && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results found
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}