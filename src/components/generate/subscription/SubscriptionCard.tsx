import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  name: string;
  description: string;
  price: number;
  creditsAmount: number;
  features: string[];
  isCurrentPlan: boolean;
  isLoading: boolean;
  selectedTier: string | null;
  onSubscribe: () => void;
  id: string;
  isBestDeal?: boolean;
}

export function SubscriptionCard({
  name,
  description,
  price,
  creditsAmount,
  features,
  isCurrentPlan,
  isLoading,
  selectedTier,
  onSubscribe,
  id,
  isBestDeal
}: SubscriptionCardProps) {
  return (
    <Card className={cn(
      "relative flex flex-col bg-card/50 backdrop-blur-sm border-border/50 h-full",
      isCurrentPlan && "border-primary",
      isBestDeal && "ring-2 ring-primary shadow-lg scale-[1.02]"
    )}>
      {isBestDeal && (
        <div className="absolute -top-3 left-0 w-full flex justify-center">
          <Badge className="bg-primary text-primary-foreground">
            Best Deal
          </Badge>
        </div>
      )}
      <CardHeader className="space-y-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-semibold">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="pt-4">
          <div className="text-4xl font-bold">
            ${price}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={onSubscribe}
          disabled={isLoading && selectedTier === id || isCurrentPlan}
          className="w-full"
          variant={isBestDeal ? "default" : "outline"}
          size="lg"
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