import { Button } from "@/components/ui/button";
import { CustomerSubscription } from "../SubscriptionTiers";

interface CurrentSubscriptionProps {
  subscription: CustomerSubscription | null;
  onManageSubscription: () => void;
}

export function CurrentSubscription({ subscription, onManageSubscription }: CurrentSubscriptionProps) {
  if (!subscription) return null;

  return (
    <div className="text-center space-y-3 mb-12 p-4 max-w-xl mx-auto rounded-lg bg-card/50 backdrop-blur-sm border border-border/50">
      <h2 className="text-xl font-semibold">Your Current Subscription</h2>
      <p className="text-muted-foreground">
        Status: {subscription.status}
        {subscription.cancel_at_period_end && " (Cancels at period end)"}
      </p>
      <Button 
        variant="outline" 
        onClick={onManageSubscription}
        className="w-full sm:w-auto"
      >
        Manage Subscription
      </Button>
    </div>
  );
}