import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
  type: "profile" | "post";
  id: string;
  title?: string;
  username?: string;
  avatar_url?: string;
  content?: string;
  media_url?: string;
  media_type?: string;
}

const MAX_RESULTS_PER_TYPE = 5; // Increased to 5 results per category

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["search", search],
    queryFn: async () => {
      if (!search) return [];

      const [profilesResponse, postsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .ilike("username", `%${search}%`)
          .limit(MAX_RESULTS_PER_TYPE),
        supabase
          .from("posts")
          .select("id, title, content, media_url, media_type")
          .or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
          .order('created_at', { ascending: false })
          .limit(MAX_RESULTS_PER_TYPE)
      ]);

      const profiles: SearchResult[] = (profilesResponse.data || []).map(profile => ({
        type: "profile",
        id: profile.user_id,
        username: profile.username,
        avatar_url: profile.avatar_url
      }));

      const posts: SearchResult[] = (postsResponse.data || []).map(post => ({
        type: "post",
        id: post.id,
        title: post.title,
        content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : ""),
        media_url: post.media_url,
        media_type: post.media_type
      }));

      return [...profiles, ...posts];
    },
    enabled: search.length > 0
  });

  const handleSelect = (result: SearchResult) => {
    if (result.type === "profile") {
      navigate(`/profile/${result.username}`);
    } else {
      navigate(`/post/${result.id}`);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[300px]"
          onFocus={() => setOpen(true)}
        />
      </PopoverTrigger>
      {open && search && (
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {searchResults.length > 0 && (
                <>
                  <CommandGroup heading="Profiles">
                    {searchResults
                      .filter(result => result.type === "profile")
                      .map(result => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex items-center gap-2 p-2"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={result.avatar_url} />
                            <AvatarFallback>
                              {result.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span>{result.username}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                  <CommandGroup heading="Posts">
                    {searchResults
                      .filter(result => result.type === "post")
                      .map(result => (
                        <CommandItem
                          key={result.id}
                          onSelect={() => handleSelect(result)}
                          className="flex flex-col items-start gap-1 p-2"
                        >
                          <span className="font-medium">{result.title}</span>
                          {result.media_url && result.media_type === 'image' && (
                            <img 
                              src={supabase.storage.from('media').getPublicUrl(result.media_url).data.publicUrl} 
                              alt={result.title}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <span className="text-sm text-muted-foreground">{result.content}</span>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
}