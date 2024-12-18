import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { NotificationContent } from "./NotificationContent";
import { supabase } from "@/integrations/supabase/client";
import { useMemo } from "react";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationItemProps {
  notification: NotificationWithProfiles;
  groupId: string;
}

export const NotificationItem = ({ notification, groupId }: NotificationItemProps) => {
  const navigate = useNavigate();

  const notificationText = useMemo(() => {
    if (!notification.actor?.username) return "";
    
    switch (notification.type) {
      case "follow":
        return `${notification.actor.username} started following you`;
      case "like":
        return `${notification.actor.username} liked your post`;
      case "comment":
        return `${notification.actor.username} commented on your post`;
      case "comment_reply":
        return `${notification.actor.username} replied to your comment`;
      case "mention":
        return `${notification.actor.username} mentioned you in a post`;
      case "repost":
        return `${notification.actor.username} reposted your post`;
      default:
        return `${notification.actor.username} interacted with your content`;
    }
  }, [notification.actor?.username, notification.type]);

  const handleNotificationClick = async () => {
    await supabase
      .from("notification_groups")
      .update({ read: true })
      .eq("id", groupId);

    if (notification.type === "follow") {
      navigate(`/profile/${notification.actor.username}`);
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  };

  if (!notification.actor) {
    return null;
  }

  return (
    <div 
      className={`p-4 rounded-lg border bg-card ${!notification.read && 'bg-[#1A1A1A]'} cursor-pointer`}
      onClick={handleNotificationClick}
    >
      <div className="flex items-start gap-3">
        <Link 
          to={`/profile/${notification.actor.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Avatar>
            <AvatarImage src={notification.actor.avatar_url || ""} />
            <AvatarFallback>
              {notification.actor.username?.[0]?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <NotificationContent 
          notification={notification}
          notificationText={notificationText}
        />
      </div>
    </div>
  );
};