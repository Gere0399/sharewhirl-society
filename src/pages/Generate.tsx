import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { SubscriptionTiers } from "@/components/generate/SubscriptionTiers";
import { Sidebar } from "@/components/feed/Sidebar";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { ModelId } from "@/types/generation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const GENERATION_TYPES = [
  { id: "images", label: "Images" },
  { id: "consistency", label: "Consistency" },
  { id: "video", label: "Video" },
  { id: "speech", label: "Speech" },
  { id: "sounds", label: "Sounds" },
  { id: "songs", label: "Songs" },
];

const IMAGE_MODELS = [
  { id: "fal-ai/flux" as ModelId, label: "Flux" },
  { id: "stabilityai/stable-diffusion-xl-base-1.0" as ModelId, label: "Stable Diffusion XL" },
  { id: "fal-ai/flux/schnell" as ModelId, label: "Flux Schnell" },
];

export default function Generate() {
  const [selectedType, setSelectedType] = useState(GENERATION_TYPES[0].id);
  const [selectedModel, setSelectedModel] = useState<ModelId>(IMAGE_MODELS[0].id);
  const [credits, setCredits] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();
      setCredits(data?.amount ?? 0);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Generate</h1>
              <div className="text-lg">
                Credits: <span className="font-semibold">{credits ?? '...'}</span>
              </div>
            </div>

            <ScrollArea className="w-full">
              <div className="flex items-center gap-4 py-2 px-4 bg-background/95 backdrop-blur-sm border-b border-border/10">
                {GENERATION_TYPES.map((type) => (
                  <DropdownMenu key={type.id}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-sm whitespace-nowrap">
                      <span
                        className={`cursor-pointer ${
                          selectedType === type.id
                            ? "text-[hsl(262,83%,74%)]"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type.label}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    {type.id === "images" && (
                      <DropdownMenuContent align="start">
                        {IMAGE_MODELS.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                          >
                            {model.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                {selectedType === "images" && (
                  <GenerateImage modelId={selectedModel} />
                )}
              </Card>
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                <GenerationHistory type={selectedType} modelId={selectedModel} />
              </Card>
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Get More Credits</h2>
              <SubscriptionTiers />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}