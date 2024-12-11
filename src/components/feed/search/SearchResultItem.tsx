import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandItem } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeAgo } from "@/utils/dateUtils";

interface SearchResultItemProps {
  result: {
    type: "profile" | "post";
    id: string;
    title?: string;
    username?: string;
    avatar_url?: string;
    content?: string;
    media_url?: string;
    media_type?: string;
    created_at?: string;
  };
  onSelect: () => void;
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  if (result.type === "profile") {
    return (
      <CommandItem
        onSelect={onSelect}
        className="flex items-center gap-2 p-2 cursor-pointer hover:bg-accent"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={result.avatar_url} />
          <AvatarFallback>
            {result.username?.[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{result.username}</span>
      </CommandItem>
    );
  }

  return (
    <CommandItem
      onSelect={onSelect}
      className="flex flex-col items-start gap-1 p-2 cursor-pointer hover:bg-accent"
    >
      <div className="flex justify-between w-full">
        <span className="font-medium line-clamp-1">{result.title}</span>
        {result.created_at && (
          <span className="text-sm text-muted-foreground">
            {formatTimeAgo(result.created_at)}
          </span>
        )}
      </div>
      {result.media_url && result.media_type === 'image' && (
        <img 
          src={supabase.storage.from('media').getPublicUrl(result.media_url).data.publicUrl} 
          alt={result.title}
          className="h-12 w-12 object-cover rounded"
        />
      )}
      {result.content && (
        <span className="text-sm text-muted-foreground line-clamp-2">
          {result.content}
        </span>
      )}
    </CommandItem>
  );
}