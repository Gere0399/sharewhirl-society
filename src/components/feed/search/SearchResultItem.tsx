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
    );
  }

  return (
    <CommandItem
      onSelect={onSelect}
      className="flex flex-col items-start gap-1 p-2"
    >
      <div className="flex justify-between w-full">
        <span className="font-medium">{result.title}</span>
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(result.created_at)}
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
  );
}