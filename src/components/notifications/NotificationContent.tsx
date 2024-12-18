import { formatDistanceToNow } from "date-fns";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationContentProps {
  notification: NotificationWithProfiles;
  notificationText: string;
}

export const NotificationContent = ({ notification, notificationText }: NotificationContentProps) => {
  return (
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
  );
};