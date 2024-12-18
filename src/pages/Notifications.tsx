import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/feed/Sidebar";
import { useNotificationGroups } from "@/hooks/useNotificationGroups";

const Notifications = () => {
  const { toast } = useToast();
  const [session, setSession] = useState<any>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Listen for changes in notifications table
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Notification change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["notification-groups", session.user.id] });
        }
      )
      .subscribe();

    // Listen for changes in notification_groups table
    const groupsChannel = supabase
      .channel('notification-groups-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notification_groups',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('Notification group change received:', payload);
          queryClient.invalidateQueries({ queryKey: ["notification-groups", session.user.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(groupsChannel);
    };
  }, [session?.user?.id, queryClient]);

  const { data: notificationGroups, isLoading } = useNotificationGroups(session?.user?.id);

  if (!session) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="container mx-auto px-4 py-8 pl-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Notifications</h1>
          <NotificationsList 
            isLoading={isLoading} 
            groups={notificationGroups} 
          />
        </div>
      </div>
    </div>
  );
};

export default Notifications;