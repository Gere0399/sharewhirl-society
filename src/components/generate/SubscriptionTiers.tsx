import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  credits_amount: number;
  price_id: string;
}

interface CustomerSubscription {
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
      {currentSubscription && (
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold">Your Current Subscription</h2>
          <p className="text-muted-foreground">
            Status: {currentSubscription.status}
            {currentSubscription.cancel_at_period_end && " (Cancels at period end)"}
          </p>
          <Button 
            variant="outline" 
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const isCurrentTier = currentSubscription?.price?.product?.id === tier.id;
          
          return (
            <Card key={tier.id} className={`flex flex-col relative ${isCurrentTier ? 'border-primary' : ''}`}>
              {isCurrentTier && (
                <Badge className="absolute top-2 right-2">
                  Current Plan
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-3xl font-bold">{tier.credits_amount} Credits</p>
                <p className="text-sm text-muted-foreground mt-2">Monthly subscription</p>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={loading && selectedTier === tier.id || isCurrentTier}
                  className="w-full"
                >
                  {loading && selectedTier === tier.id ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentTier ? (
                    "Current Plan"
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}