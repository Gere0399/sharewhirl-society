import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { NotificationContent } from "./NotificationContent";
import { supabase } from "@/integrations/supabase/client";
import { useMemo, useState } from "react";
import { NotificationActorsDialog } from "./NotificationActorsDialog";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationItemProps {
  notification: NotificationWithProfiles;
  groupId: string;
  otherActors?: Tables<"profiles">[];
}

export const NotificationItem = ({ notification, groupId, otherActors = [] }: NotificationItemProps) => {
  const navigate = useNavigate();
  const [showActorsDialog, setShowActorsDialog] = useState(false);

  const notificationText = useMemo(() => {
    if (!notification.actor?.username) return "";
    
    const otherActorsCount = otherActors.length;
    const hasOthers = otherActorsCount > 0;
    
    const baseText = (type: string) => {
      if (hasOthers) {
        const othersText = otherActorsCount === 1 
          ? "1 other" 
          : `${otherActorsCount} others`;
        return `${notification.actor.username} and ${othersText}`;
      }
      return notification.actor.username;
    };
    
    switch (notification.type) {
      case "follow":
        return `${baseText("follow")} started following you`;
      case "like":
        return `${baseText("like")} liked your post`;
      case "comment":
        return `${baseText("comment")} commented on your post`;
      case "comment_reply":
        return `${baseText("reply")} replied to your comment`;
      case "mention":
        return `${baseText("mention")} mentioned you in a post`;
      case "repost":
        return `${baseText("repost")} reposted your post`;
      default:
        return `${baseText("interaction")} interacted with your content`;
    }
  }, [notification.actor?.username, notification.type, otherActors.length]);

  const handleNotificationClick = async () => {
    console.log("Handling notification click:", { notification, groupId });
    
    try {
      await supabase
        .from("notification_groups")
        .update({ read: true })
        .eq("id", groupId);

      console.log("Marked notification group as read:", groupId);

      if (notification.type === "follow") {
        navigate(`/profile/${notification.actor.username}`);
      } else if (notification.post_id) {
        // If it's a comment notification, we'll try to scroll to the comment
        if (notification.type === "comment" || notification.type === "comment_reply") {
          navigate(`/post/${notification.post_id}?comment=${notification.id}`);
        } else {
          navigate(`/post/${notification.post_id}`);
        }
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  const handleShowActors = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActorsDialog(true);
  };

  if (!notification.actor) {
    console.log("No actor found for notification:", notification);
    return null;
  }

  return (
    <>
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
            onShowActors={handleShowActors}
            hasOthers={otherActors.length > 0}
          />
        </div>
      </div>

      <NotificationActorsDialog
        actors={[notification.actor, ...otherActors]}
        isOpen={showActorsDialog}
        onOpenChange={setShowActorsDialog}
      />
    </>
  );
};