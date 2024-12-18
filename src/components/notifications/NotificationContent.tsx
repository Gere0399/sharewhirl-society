import { formatDistanceToNow } from "date-fns";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

interface NotificationContentProps {
  notification: NotificationWithProfiles;
  notificationText: string;
  onShowActors: (e: React.MouseEvent) => void;
  hasOthers: boolean;
}

export const NotificationContent = ({ 
  notification, 
  notificationText,
  onShowActors,
  hasOthers
}: NotificationContentProps) => {
  return (
    <div className="flex-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm">
            <span dangerouslySetInnerHTML={{ 
              __html: notificationText.replace(
                /and \d+ others/, 
                match => `and <button class="text-primary font-semibold hover:underline">${match.slice(4)}</button>`
              )
            }} 
            onClick={hasOthers ? onShowActors : undefined}
            />
          </div>
          {notification.post && (
            <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
              {notification.post.title}
            </p>
          )}
        </div>
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDistanceToNow(new Date(notification.created_at || ''), {
            addSuffix: true,
          })}
        </span>
      </div>
    </div>
  );
};