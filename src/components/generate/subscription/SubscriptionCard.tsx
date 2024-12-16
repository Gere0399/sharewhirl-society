import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const isBestDeal = creditsAmount === 300;

  return (
    <Card className={cn(
      "relative flex flex-col bg-card/50 backdrop-blur-sm border-border/50 h-full",
      isCurrentPlan && "border-primary",
      isBestDeal && "ring-2 ring-primary shadow-lg scale-[1.02]"
    )}>
      {isCurrentPlan && (
        <Badge className="absolute top-4 right-4">
          Current Plan
        </Badge>
      )}
      {isBestDeal && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            Best Deal
          </Badge>
        </div>
      )}
      <CardHeader className="space-y-2 text-center">
        <h3 className="text-xl font-semibold">{name}</h3>
        <div className="space-y-1">
          <div className="text-4xl font-bold">
            ${price}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3 text-sm">
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              {creditsAmount} Credits per month
            </Badge>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              24/7 Support
            </Badge>
          </li>
          <li className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10">
              Cancel anytime
            </Badge>
          </li>
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