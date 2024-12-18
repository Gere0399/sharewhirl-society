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
      <p className="text-center text-muted-foreground">
        No notifications yet
      </p>
    );
  }

  // Filter out groups with no notifications
  const validGroups = groups.filter(group => group.notifications?.length > 0);

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