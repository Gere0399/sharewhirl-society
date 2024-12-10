import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Sidebar } from "@/components/feed/Sidebar";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Tables } from "@/integrations/supabase/types";

type NotificationWithProfiles = Tables<"notifications"> & {
  actor: Tables<"profiles">;
  post?: Tables<"posts">;
};

const Notifications = () => {
  const { toast } = useToast();
  const [session, setSession] = useState(null);

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

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      console.log("Fetching notifications...");
      const { data, error } = await supabase
        .from("notifications")
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey (
            id,
            user_id,
            username,
            full_name,
            avatar_url,
            bio,
            created_at,
            updated_at
          ),
          post:posts!notifications_post_id_fkey (
            id,
            title,
            content,
            created_at,
            updated_at
          )
        `)
        .order("created_at", { ascending: false })
        .returns<NotificationWithProfiles[]>();

      if (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: "Error",
          description: "Failed to fetch notifications",
          variant: "destructive",
        });
        return [];
      }

      console.log("Fetched notifications:", data);
      return data;
    },
    enabled: !!session,
  });

  if (!session) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Notifications</h1>
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {notifications?.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
                {notifications?.length === 0 && (
                  <p className="text-center text-muted-foreground">
                    No notifications yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;