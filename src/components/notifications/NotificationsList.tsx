import { Loader } from "lucide-react";
import { NotificationItem } from "./NotificationItem";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

type NotificationGroup = {
  id: string;
  notifications: NotificationWithProfiles[];
  type: string;
  post_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string | null;
  updated_at: string | null;
  user_id: string;
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

  return (
    <div className="space-y-4">
      {groups.map(group => (
        <NotificationItem
          key={group.id}
          notification={group.notifications?.[0]}
          groupId={group.id}
        />
      ))}
    </div>
  );
};