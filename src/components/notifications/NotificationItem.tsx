import { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tables } from "@/integrations/supabase/types";
import { NotificationActorsDialog } from "./NotificationActorsDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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

  const { data: groupedActors } = useQuery({
    queryKey: ["notification-actors", notification.type, notification.post_id],
    queryFn: async () => {
      try {
        const query = supabase
          .from("notifications")
          .select(`
            actor:actor_id (
              id,
              user_id,
              username,
              avatar_url,
              bio,
              followers_count,
              created_at,
              updated_at,
              full_name,
              has_subscription
            )
          `)
          .eq("type", notification.type)
          .eq("user_id", notification.user_id)
          .order("created_at", { ascending: false });

        // Only add post_id filter for non-follow notifications
        if (notification.type !== "follow" && notification.post_id) {
          query.eq("post_id", notification.post_id);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data?.map(n => n.actor) || [];
      } catch (error) {
        console.error("Error fetching notification actors:", error);
        return [];
      }
    },
    enabled: !!notification.type && !!notification.user_id
  });

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
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm">{notificationText}</div>
                {notification.post && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {notification.post.title}
                  </p>
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

      <NotificationActorsDialog
        actors={groupedActors || []}
        isOpen={isActorsDialogOpen}
        onOpenChange={setIsActorsDialogOpen}
      />
    </>
  );
};