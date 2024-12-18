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
  post_id?: string;
  notifications: NotificationWithProfiles[];
};

interface NotificationsListProps {
  isLoading: boolean;
  groups?: NotificationGroup[];
}

export const NotificationsList = ({ isLoading, groups }: NotificationsListProps) => {
  console.log("[NotificationsList] Rendering with groups:", groups?.length);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!groups?.length) {
    console.log("[NotificationsList] No notifications to display");
    return (
      <p className="text-center text-muted-foreground">
        No notifications yet
      </p>
    );
  }

  // Filter out groups with no notifications
  const validGroups = groups.filter(group => {
    const hasNotifications = group.notifications?.length > 0;
    console.log(`[NotificationsList] Group ${group.id} has ${group.notifications?.length || 0} notifications`);
    return hasNotifications;
  });

  console.log("[NotificationsList] Valid groups to display:", validGroups.length);

  return (
    <div className="space-y-4">
      {validGroups.map(group => (
        <div key={group.id} className="space-y-2">
          {group.notifications?.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              groupId={group.id}
            />
          ))}
        </div>
      ))}
    </div>
  );
};