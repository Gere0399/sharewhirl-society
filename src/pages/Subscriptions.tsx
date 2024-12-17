import { SubscriptionTiers } from "@/components/generate/SubscriptionTiers";
import { Sidebar } from "@/components/feed/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Subscriptions() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Buy a subscription</h1>
            </div>
            <SubscriptionTiers />
          </div>
        </div>
      </main>
    </div>
  );
}