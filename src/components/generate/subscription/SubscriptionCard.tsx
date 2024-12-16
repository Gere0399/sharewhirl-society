import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";

interface SubscriptionCardProps {
  name: string;
  description: string;
  price: number;
  creditsAmount: number;
  isCurrentPlan: boolean;
  isLoading: boolean;
  selectedTier: string | null;
  onSubscribe: () => void;
  id: string;
}

export function SubscriptionCard({
  name,
  description,
  price,
  creditsAmount,
  isCurrentPlan,
  isLoading,
  selectedTier,
  onSubscribe,
  id
}: SubscriptionCardProps) {
  const isBestDeal = price === 22.70; // Middle tier is best deal

  return (
    <Card className={`relative flex flex-col ${isCurrentPlan ? 'border-primary' : ''} 
      ${isBestDeal ? 'ring-2 ring-primary shadow-lg scale-105' : ''}`}>
      {isCurrentPlan && (
        <Badge className="absolute top-2 right-2">
          Current Plan
        </Badge>
      )}
      {isBestDeal && (
        <Badge variant="secondary" className="absolute top-2 left-2">
          Best Deal
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="flex flex-col gap-2">
          <span className="text-xl">{name}</span>
          <span className="text-4xl font-bold">${price}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="text-sm">{creditsAmount} Credits per month</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={onSubscribe}
          disabled={isLoading && selectedTier === id || isCurrentPlan}
          className="w-full"
          variant={isBestDeal ? "default" : "outline"}
        >
          {isLoading && selectedTier === id ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : (
            "Subscribe Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}