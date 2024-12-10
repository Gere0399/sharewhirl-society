import { Eye } from "lucide-react";

interface PostStatsProps {
  viewsCount: number;
}

export function PostStats({ viewsCount }: PostStatsProps) {
  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span className="text-sm">{viewsCount}</span>
    </div>
  );
}