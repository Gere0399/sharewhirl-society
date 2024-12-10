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

interface SearchResult {
  type: "profile" | "post";
  id: string;
  title?: string;
  username?: string;
  avatar_url?: string;
  content?: string;
}

const MAX_RESULTS_PER_TYPE = 3; // Limit results to 3 per category

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
          .select("id, title, content")
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
        content: post.content?.substring(0, 50) + (post.content?.length > 50 ? "..." : "")
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
                          className="flex items-center gap-2"
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
      )}
    </Popover>
  );
}