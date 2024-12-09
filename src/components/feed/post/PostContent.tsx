import { Badge } from "@/components/ui/badge";

interface PostContentProps {
  title: string;
  content: string;
  tags?: string[];
}

export function PostContent({ title, content, tags }: PostContentProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{content}</p>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.map((tag: string) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}