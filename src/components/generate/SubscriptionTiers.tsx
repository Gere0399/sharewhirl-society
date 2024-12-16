import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionCard } from "./subscription/SubscriptionCard";
import { CurrentSubscription } from "./subscription/CurrentSubscription";
import { PricingHeader } from "./subscription/PricingHeader";

const SUBSCRIPTION_TIERS = [
  {
    id: "prod_R7RzG9YcXrBRhx",
    name: "Basic",
    description: "Perfect for getting started with AI generation",
    price: 3.99,
    creditsAmount: 100,
    features: [
      "100 credits",
      "Unlock more films from the community",
      "Supportive Discord community"
    ]
  },
  {
    id: "prod_R7S1FahwYOaUbG",
    name: "Pro",
    description: "For power users who need more generation capacity",
    price: 22.70,
    creditsAmount: 550,
    features: [
      "500 credits",
      "Everything else in Basic plan",
      "Remove Ads"
    ],
    isBestDeal: true
  },
  {
    id: "prod_R7S1Sdv96HwC69",
    name: "Enterprise",
    description: "The perfect plan for enterprises that want to start working with us",
    price: 100,
    creditsAmount: 2400,
    features: [
      "2500 credits",
      "Everything else in Pro plan",
      "Can join our private partners Discord group"
    ]
  }
];

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

export function SubscriptionTiers() {
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<CustomerSubscription | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentSubscription();
  }, []);

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
    } catch (error: any) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-background/80 py-20">
      <div className="container px-4 mx-auto">
        <PricingHeader />
        
        <CurrentSubscription 
          subscription={currentSubscription}
          onManageSubscription={async () => {
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
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const isCurrentTier = currentSubscription?.price?.product?.id === tier.id;
            
            return (
              <SubscriptionCard
                key={tier.id}
                {...tier}
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