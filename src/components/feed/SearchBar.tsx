import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface SearchResult {
  type: "profile" | "post";
  id: string;
  title?: string;
  username?: string;
  avatar_url?: string;
  content?: string;
}

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
          .limit(5),
        supabase
          .from("posts")
          .select("id, title, content")
          .or(`title.ilike.%${search}%,content.ilike.%${search}%,tags.cs.{${search}}`)
          .limit(5)
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
        content: post.content
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
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="w-[300px] justify-between"
        >
          <Search className="mr-2 h-4 w-4" />
          <span className="text-muted-foreground">
            Search...
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search profiles and posts..." 
            value={search}
            onValueChange={setSearch}
          />
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
                      >
                        {result.username}
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
                      >
                        {result.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}