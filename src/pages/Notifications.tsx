import { Sidebar } from "@/components/feed/Sidebar";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface NotificationsProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

const Notifications = ({ isCreatePostOpen, setIsCreatePostOpen }: NotificationsProps) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*, actor:profiles(*), post:posts(*)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setNotifications(data || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return <div>Loading notifications...</div>;
  }

  return (
    <div>
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-muted-foreground">No notifications yet</p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;