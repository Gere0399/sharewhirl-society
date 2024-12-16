import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionCard } from "./subscription/SubscriptionCard";
import { CurrentSubscription } from "./subscription/CurrentSubscription";

export interface CustomerSubscription {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
  price: {
    product: {
      id: string;
    }
  }
}

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  credits_amount: number;
  price_id: string;
}

export function SubscriptionTiers() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CustomerSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTiers();
    fetchCurrentSubscription();
  }, []);

  const fetchTiers = async () => {
    const { data } = await supabase
      .from('subscription_tiers')
      .select('*')
      .order('credits_amount', { ascending: true });
    
    if (data) {
      setTiers(data);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) return;

      const response = await fetch('/functions/v1/get-subscription', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.subscription) {
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription status",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (tierId: string) => {
    try {
      setLoading(true);
      setSelectedTier(tierId);

      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please log in to subscribe');
      }

      const response = await fetch('/functions/v1/create-checkout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier_id: tierId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (url) window.location.href = url;

    } catch (error: any) {
      toast({
        title: "Subscription error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please log in to manage your subscription');
      }

      const response = await fetch('/functions/v1/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (url) window.location.href = url;

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-20">
      <div className="space-y-8 container px-4 mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight">
            Security. Privacy. Freedom.
          </h1>
          <p className="text-xl text-muted-foreground">
            Select a plan to access your favorite content with lightning speed and unlimited data.
          </p>
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              Open source
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              No-logs policy
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary" />
              </div>
              24/7 Live support
            </div>
          </div>
        </div>

        <CurrentSubscription 
          subscription={currentSubscription}
          onManageSubscription={handleManageSubscription}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentTier = currentSubscription?.price?.product?.id === tier.id;
            
            return (
              <SubscriptionCard
                key={tier.id}
                id={tier.id}
                name={tier.name}
                description={tier.description}
                price={tier.credits_amount === 50 ? 3.99 : tier.credits_amount === 300 ? 22.70 : 100}
                creditsAmount={tier.credits_amount}
                isCurrentPlan={isCurrentTier}
                isLoading={loading}
                selectedTier={selectedTier}
                onSubscribe={() => handleSubscribe(tier.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}