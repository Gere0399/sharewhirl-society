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
      "relative flex flex-col border-[#2A2F3C] h-full",
      !isBestDeal && "bg-[#1A1F2C]/90",
      isBestDeal && "bg-[#1A1F2C]/90",
      isCurrentPlan && "border-primary",
      isBestDeal ? "ring-[4px] ring-[#9b87f5] shadow-lg scale-[1.02] mt-4 mb-8 md:mb-0" : "border-2 border-[#D6BCFA]"
    )}>
      {isBestDeal && (
        <>
          <div className="absolute -top-8 left-[-2px] right-[-2px]">
            <div className="bg-[#9b87f5] text-white px-6 py-2 rounded-t-lg flex items-center justify-center gap-2 mx-auto">
              <span className="font-medium">Most Popular</span>
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
          <h3 className="text-2xl font-semibold text-white">{name}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className="pt-4">
          <div className="text-4xl font-bold text-white">
            ${price}
            <span className="text-sm font-normal text-gray-400">/month</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#9b87f5]" />
              <span className="text-sm text-gray-300">{feature}</span>
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
            isBestDeal ? "bg-[#9b87f5] hover:bg-[#9b87f5]/90" : "bg-[#2A2F3C] hover:bg-[#3A3F4C]",
            "text-white"
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