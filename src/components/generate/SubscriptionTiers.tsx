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

      const data = await response.json();
      if (data.subscription) {
        setCurrentSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
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
    <div className="space-y-8">
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl font-bold">Unlock Your Creative Potential</h1>
        <p className="text-xl text-muted-foreground">
          Choose a plan that fits your needs and start creating amazing content today
        </p>
      </div>

      <CurrentSubscription 
        subscription={currentSubscription}
        onManageSubscription={handleManageSubscription}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
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
  );
}