import { Loader } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

type NotificationGroup = Tables<"notification_groups"> & {
  notifications: NotificationWithProfiles[];
};

interface NotificationsListProps {
  isLoading: boolean;
  groups?: NotificationGroup[];
}

export const NotificationsList = ({ isLoading, groups }: NotificationsListProps) => {
  console.log("NotificationsList received groups:", groups);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!groups?.length) {
    console.log("No notifications to display");
    return (
      <p className="text-center text-muted-foreground">
        No notifications yet
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map(group => {
        console.log("Rendering group:", group.id, "with notifications:", group.notifications);
        return (
          <div key={group.id}>
            {group.notifications?.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                groupId={group.id}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};