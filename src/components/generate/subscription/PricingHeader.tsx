import { Badge } from "@/components/ui/badge";

export function PricingHeader() {
  return (
    <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Security. Privacy. Freedom.
      </h1>
      <p className="text-xl text-muted-foreground">
        Select a plan to access your favorite content with lightning speed and unlimited data.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            Open source
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            No-logs policy
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10">
            24/7 Live support
          </Badge>
        </div>
      </div>
    </div>
  );
}