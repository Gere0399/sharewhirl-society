import { useState } from "react";
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
      const { data } = await supabase
        .from("notifications")
        .select(`
          actor:actor_id (
            user_id,
            username,
            avatar_url,
            bio,
            followers_count
          )
        `)
        .eq("type", notification.type)
        .eq("post_id", notification.post_id)
        .order("created_at", { ascending: false });
      
      return data?.map(n => n.actor) || [];
    }
  });

  const handleNotificationClick = async () => {
    // Mark notification as read
    await supabase
      .from("notification_groups")
      .update({ read: true })
      .eq("id", groupId);

    // Navigate based on notification type
    if (notification.type === "comment" || notification.type === "comment_reply") {
      const commentId = notification.type === "comment_reply" 
        ? await getCommentId()
        : null;
      
      navigate(`/post/${notification.post_id}${commentId ? `#comment-${commentId}` : ''}`);
    } else if (notification.post_id) {
      navigate(`/post/${notification.post_id}`);
    }
  };

  const getCommentId = async () => {
    const { data } = await supabase
      .from("comments")
      .select("id")
      .eq("post_id", notification.post_id)
      .eq("user_id", notification.actor_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    return data?.id;
  };

  const getNotificationText = () => {
    if (!groupedActors?.length) return "";
    
    const otherActorsCount = groupedActors.length - 1;
    const mainActor = groupedActors[0];
    
    let text = mainActor.username;
    if (otherActorsCount > 0) {
      text += ` and `;
      if (otherActorsCount === 1) {
        text += `${groupedActors[1].username}`;
      } else {
        text += `<button class="text-primary hover:underline" onclick="setIsActorsDialogOpen(true)">${otherActorsCount} others</button>`;
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
  };

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
                {notification.actor.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div 
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: getNotificationText() }}
                />
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