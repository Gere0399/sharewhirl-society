import { BadgeCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function VerifiedBadge() {
  return (
    <Tooltip>
      <TooltipTrigger>
        <BadgeCheck className="h-4 w-4 text-primary fill-primary" />
      </TooltipTrigger>
      <TooltipContent>
        <p>Verified User</p>
      </TooltipContent>
    </Tooltip>
  );
}