import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SearchResultItem } from "./search/SearchResultItem";
import { useSearch } from "./search/useSearch";
import { Loader2 } from "lucide-react";

export function SearchBar() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const { search, setSearch, searchResults, isLoading } = useSearch();

  const handleSelect = (result: any) => {
    if (result.type === "profile") {
      navigate(`/profile/${result.username}`);
    } else {
      navigate(`/post/${result.id}`);
    }
    setSearch("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search posts and profiles..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="w-[300px] mx-auto bg-secondary/50 border-0 focus-visible:ring-0 placeholder:text-muted-foreground"
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0 bg-secondary/50 border-border/10" 
        align="start"
        sideOffset={5}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Command className="bg-transparent">
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : searchResults.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <>
                {searchResults.filter(result => result.type === "profile").length > 0 && (
                  <CommandGroup heading="Profiles">
                    {searchResults
                      .filter(result => result.type === "profile")
                      .map(result => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={() => handleSelect(result)}
                        />
                      ))}
                  </CommandGroup>
                )}
                {searchResults.filter(result => result.type === "post").length > 0 && (
                  <CommandGroup heading="Posts">
                    {searchResults
                      .filter(result => result.type === "post")
                      .map(result => (
                        <SearchResultItem
                          key={result.id}
                          result={result}
                          onSelect={() => handleSelect(result)}
                        />
                      ))}
                  </CommandGroup>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}