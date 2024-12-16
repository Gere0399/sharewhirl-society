import { Button } from "@/components/ui/button";
import { CustomerSubscription } from "../SubscriptionTiers";

interface CurrentSubscriptionProps {
  subscription: CustomerSubscription | null;
  onManageSubscription: () => void;
}

export function CurrentSubscription({ subscription, onManageSubscription }: CurrentSubscriptionProps) {
  if (!subscription) return null;

  return (
    <div className="text-center space-y-2 mb-8">
      <h2 className="text-xl font-semibold">Your Current Subscription</h2>
      <p className="text-muted-foreground">
        Status: {subscription.status}
        {subscription.cancel_at_period_end && " (Cancels at period end)"}
      </p>
      <Button 
        variant="outline" 
        onClick={onManageSubscription}
      >
        Manage Subscription
      </Button>
    </div>
  );
}