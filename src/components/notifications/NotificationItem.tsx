import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { NotificationActorsDialog } from "./NotificationActorsDialog";
import { supabase } from "@/integrations/supabase/client";
import { NotificationContent } from "./NotificationContent";
import { useNotificationActors } from "@/hooks/useNotificationActors";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationItemProps {
  notification: NotificationWithProfiles;
  groupId: string;
}

export const NotificationItem = ({ notification, groupId }: NotificationItemProps) => {
  const [isActorsDialogOpen, setIsActorsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const { data: groupedActors } = useNotificationActors(notification, true);

  const handleNotificationClick = useCallback(async () => {
    await supabase
      .from("notification_groups")
      .update({ read: true })
      .eq("id", groupId);

    if (notification.type === "follow") {
      navigate(`/profile/${notification.actor.username}`);
    } else if (notification.type === "comment" || notification.type === "comment_reply") {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("id")
          .eq("post_id", notification.post_id)
          .eq("user_id", notification.actor_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        if (error) throw error;
        navigate(`/post/${notification.post_id}${data?.id ? `#comment-${data.id}` : ''}`);
      } catch (error) {
        console.error("Error fetching comment:", error);
        navigate(`/post/${notification.post_id}`);
      }
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  }, [groupId, notification, navigate]);

  const notificationText = useMemo(() => {
    if (!groupedActors?.length || !notification.actor?.username) return "";
    
    const otherActorsCount = groupedActors.length - 1;
    const mainActor = groupedActors[0];
    
    let text = mainActor.username || "Someone";
    if (otherActorsCount > 0) {
      text += ` and `;
      if (otherActorsCount === 1) {
        text += `${groupedActors[1].username || "someone"}`;
      } else {
        text += `${otherActorsCount} others`;
      }
    }

    switch (notification.type) {
      case "follow":
        return `${text} started following you`;
      case "like":
        return `${text} liked your post`;
      case "comment":
        return `${text} commented on your post`;
      case "comment_reply":
        return `${text} replied to your comment`;
      case "mention":
        return `${text} mentioned you in a post`;
      case "repost":
        return `${text} reposted your post`;
      default:
        return `${text} interacted with your content`;
    }
  }, [groupedActors, notification.actor?.username, notification.type]);

  if (!notification.actor) {
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
          />
        </div>
      </div>

      <NotificationActorsDialog
        actors={groupedActors || []}
        isOpen={isActorsDialogOpen}
        onOpenChange={setIsActorsDialogOpen}
      />
    </>
  );
};