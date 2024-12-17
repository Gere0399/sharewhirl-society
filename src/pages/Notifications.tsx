import { Sidebar } from "@/components/feed/Sidebar";
import { NotificationItem } from "@/components/notifications/NotificationItem";

interface NotificationsProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

const Notifications = ({ isCreatePostOpen, setIsCreatePostOpen }: NotificationsProps) => {
  return (
    <div>
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>
          <NotificationItem />
        </div>
      </main>
    </div>
  );
};

export default Notifications;