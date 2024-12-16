import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, Check, ChevronDown, ArrowDown } from "lucide-react";
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
      isBestDeal && "ring-2 ring-[#9b87f5] shadow-lg scale-[1.02] mt-4"
    )}>
      {isBestDeal && (
        <>
          <div className="absolute -top-8 left-0 right-0 w-full">
            <div className="bg-[#9b87f5] text-white px-6 py-2 rounded-t-lg flex items-center justify-center gap-2 mx-auto">
              <ArrowDown className="h-4 w-4" />
              <span className="font-medium">Best Deal</span>
            </div>
          </div>
          <div className="absolute inset-x-0 -top-px h-[2px] bg-gradient-to-r from-transparent via-[#9b87f5] to-transparent" />
          <div className="absolute inset-x-0 -bottom-px h-[2px] bg-gradient-to-r from-transparent via-[#9b87f5] to-transparent" />
          <div className="absolute inset-y-0 -left-px w-[2px] bg-gradient-to-b from-transparent via-[#9b87f5] to-transparent" />
          <div className="absolute inset-y-0 -right-px w-[2px] bg-gradient-to-b from-transparent via-[#9b87f5] to-transparent" />
        </>
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
              <Check className="h-4 w-4 text-[#9b87f5]" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="pt-4">
        <Button 
          onClick={onSubscribe}
          disabled={isLoading && selectedTier === id || isCurrentPlan}
          className={cn(
            "w-full",
            isBestDeal ? "bg-[#9b87f5] hover:bg-[#9b87f5]/90" : "bg-background hover:bg-accent"
          )}
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