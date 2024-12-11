import { useRef } from "react";
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
  const { search, setSearch, searchResults, isLoading } = useSearch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSelect = (result: any) => {
    if (result.type === "profile") {
      navigate(`/profile/${result.username}`);
    } else {
      navigate(`/post/${result.id}`);
    }
    setSearch("");
  };

  return (
    <Popover defaultOpen={true}>
      <PopoverTrigger asChild>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search posts and profiles..."
          value={search}
          onChange={handleInputChange}
          className="w-[300px] mx-auto"
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] p-0" 
        align="start"
        sideOffset={5}
      >
        <Command>
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : search.trim() === "" ? (
              <CommandEmpty>Start typing to search...</CommandEmpty>
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