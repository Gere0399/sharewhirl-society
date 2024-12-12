import { SubscriptionTiers } from "@/components/generate/SubscriptionTiers";
import { Sidebar } from "@/components/feed/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Subscriptions() {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">Get More Credits</h1>
            <SubscriptionTiers />
          </div>
        </div>
      </main>
    </div>
  );
}