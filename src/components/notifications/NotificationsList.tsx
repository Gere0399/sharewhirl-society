import { Loader } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

type NotificationGroup = {
  id: string;
  type: string;
  post_id?: string | null;
  comment_id?: string | null;
  notifications: NotificationWithProfiles[];
};

interface NotificationsListProps {
  isLoading: boolean;
  groups?: NotificationGroup[];
}

export const NotificationsList = ({ isLoading, groups }: NotificationsListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!groups?.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-muted-foreground">
          No notifications yet
        </p>
      </div>
    );
  }

  // Sort groups by the most recent notification's created_at
  const sortedGroups = [...groups].sort((a, b) => {
    const aDate = new Date(a.notifications[0]?.created_at || 0);
    const bDate = new Date(b.notifications[0]?.created_at || 0);
    return bDate.getTime() - aDate.getTime();
  });

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-0 space-y-3">
      {sortedGroups.map(group => (
        <div key={group.id}>
          {group.notifications.map((notification, index) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              groupId={group.id}
              otherActors={index === 0 ? group.notifications.slice(1).map(n => n.actor) : []}
            />
          ))}
        </div>
      ))}
    </div>
  );
};