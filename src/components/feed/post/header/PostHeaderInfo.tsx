import { Link } from "react-router-dom";
import { VerifiedBadge } from "./VerifiedBadge";
import { formatTimeAgo } from "@/utils/dateUtils";

interface PostHeaderInfoProps {
  username: string;
  created_at: string;
  has_subscription?: boolean;
}

export function PostHeaderInfo({ username, created_at, has_subscription }: PostHeaderInfoProps) {
  return (
    <div className="flex items-center gap-1">
      <Link
        to={`/profile/${username}`}
        className="font-medium hover:underline truncate"
      >
        {username}
      </Link>
      {has_subscription && <VerifiedBadge />}
      <span className="text-muted-foreground text-sm">
        · {formatTimeAgo(created_at)}
      </span>
    </div>
  );
}