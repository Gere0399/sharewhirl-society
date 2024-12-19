import { useState } from "react";
import { Sidebar } from "@/components/feed/Sidebar";
import { SearchBar } from "@/components/feed/SearchBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSearch } from "@/components/feed/search/useSearch";

export default function Search() {
  const [search, setSearch] = useState("");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { searchResults, isLoading } = useSearch(search);

  const profiles = searchResults.filter(result => result.type === "profile");
  const posts = searchResults.filter(result => result.type === "post");

  return (
    <div className="flex min-h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'} overflow-x-hidden`}>
        <header className={`fixed top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-sm ${isMobile ? 'right-0 left-0' : 'right-0 left-16'}`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2 max-w-2xl mx-auto">
              <SearchBar value={search} onChange={setSearch} />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {profiles.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Profiles</h2>
                <Separator />
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-start justify-between p-4 bg-card rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{profile.username}</h3>
                        <span className="text-sm text-muted-foreground">
                          {profile.followers_count} followers
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {profile.bio}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/profile/${profile.username}`)}
                    >
                      View Profile
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {posts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Posts</h2>
                <Separator />
                {posts.map((post) => (
                  <div key={post.id} className="flex gap-4 p-4 bg-card rounded-lg">
                    {post.media_url && (
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
                          {post.tags && (
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

            {!isLoading && searchResults.length === 0 && search && (
              <div className="text-center py-8 text-muted-foreground">
                No results found
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}