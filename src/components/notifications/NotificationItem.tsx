import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationItemProps {
  notification: NotificationWithProfiles;
}

export const NotificationItem = ({ notification }: NotificationItemProps) => {
  const getNotificationText = () => {
    switch (notification.type) {
      case "follow":
        return "started following you";
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "comment_reply":
        return "replied to your comment";
      case "mention":
        return "mentioned you in a post";
      case "repost":
        return "reposted your post";
      default:
        return "interacted with your content";
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${notification.read ? 'bg-[#1A1F2C]' : 'bg-[#222222]'}`}>
      <div className="flex items-start gap-3">
        <Link to={`/profile/${notification.actor.username}`}>
          <Avatar>
            <AvatarImage src={notification.actor.avatar_url || ""} />
            <AvatarFallback>
              {notification.actor.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                to={`/profile/${notification.actor.username}`}
                className="font-semibold hover:underline"
              >
                {notification.actor.username}
              </Link>{" "}
              <span className="text-muted-foreground">{getNotificationText()}</span>
              {notification.post && (
                <Link
                  to={`/post/${notification.post_id}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <p className="mt-1 line-clamp-1">{notification.post.title}</p>
                </Link>
              )}
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};