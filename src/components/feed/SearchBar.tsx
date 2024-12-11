import { useState, useEffect, useRef } from "react";
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
import { formatDistanceToNowStrict, differenceInDays, differenceInWeeks, differenceInMonths } from "date-fns";

interface SearchResult {
  type: "profile" | "post";
  id: string;
  title?: string;
  username?: string;
  avatar_url?: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  created_at?: string;
}

const MAX_RESULTS_PER_TYPE = 5;
const DEBOUNCE_DELAY = 300; // milliseconds

export function SearchBar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [search]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["search", debouncedSearch],
    queryFn: async () => {
      if (!debouncedSearch) return [];

      const [profilesResponse, postsResponse] = await Promise.all([
        supabase
          .from("profiles")
          .select("user_id, username, avatar_url")
          .ilike("username", `%${debouncedSearch}%`)
          .order('username')
          .limit(MAX_RESULTS_PER_TYPE),
        supabase
          .from("posts")
          .select("id, title, content, media_url, media_type, created_at")
          .or(`title.ilike.%${debouncedSearch}%,content.ilike.%${debouncedSearch}%,tags.cs.{${debouncedSearch}}`)
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
        media_type: post.media_type,
        created_at: post.created_at
      }));

      return [...profiles, ...posts];
    },
    enabled: debouncedSearch.length > 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setOpen(value.length > 0);
  };

  const formatDate = (date?: string) => {
    if (!date) return "";
    
    try {
      const postDate = new Date(date);
      const now = new Date();
      
      const days = differenceInDays(now, postDate);
      const weeks = differenceInWeeks(now, postDate);
      const months = differenceInMonths(now, postDate);
      
      if (days < 1) {
        return formatDistanceToNowStrict(postDate, { addSuffix: true });
      } else if (days === 1) {
        return "1 day ago";
      } else if (days < 7) {
        return `${days} days ago`;
      } else if (weeks === 1) {
        return "1 week ago";
      } else if (weeks < 4) {
        return `${weeks} weeks ago`;
      } else if (months === 1) {
        return "1 month ago";
      } else {
        return `${months} months ago`;
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.type === "profile") {
      navigate(`/profile/${result.username}`);
    } else {
      navigate(`/post/${result.id}`);
    }
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={search}
          onChange={handleInputChange}
          className="w-[300px] mx-auto"
          onFocus={() => setOpen(true)}
        />
      </PopoverTrigger>
      {search && (
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
                          <div className="flex justify-between w-full">
                            <span className="font-medium">{result.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(result.created_at)}
                            </span>
                          </div>
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