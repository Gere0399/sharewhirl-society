import { Badge } from "@/components/ui/badge";
import { Code2, ShieldCheck, Headphones } from "lucide-react";

export function PricingHeader() {
  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
      <p className="text-sm font-medium text-primary">Pricing</p>
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-b from-foreground/80 to-foreground/60 bg-clip-text text-transparent">
        Security. Privacy. Freedom.
        <br />
        for Everyone.
      </h1>
      <p className="text-xl text-muted-foreground">
        Select a plan to access your favorite content with lightning speed and unlimited data.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">Open source</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">No-logs policy</span>
        </div>
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4" />
          <span className="text-sm text-muted-foreground">24/7 Live support</span>
        </div>
      </div>
    </div>
  );
}