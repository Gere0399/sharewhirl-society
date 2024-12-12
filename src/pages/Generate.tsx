import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CreditDisplay } from "@/components/generate/CreditDisplay";

const GENERATION_TYPES = [
  { id: "images", label: "Images" },
  { id: "consistency", label: "Consistency" },
  { id: "video", label: "Video" },
  { id: "speech", label: "Speech" },
  { id: "sounds", label: "Sounds" },
  { id: "songs", label: "Songs" },
];

const IMAGE_MODELS = [
  { id: "fal-ai/flux" as ModelId, label: "Flux", cost: 1 },
  { id: "stabilityai/stable-diffusion-xl-base-1.0" as ModelId, label: "Stable Diffusion XL", cost: 2 },
  { id: "fal-ai/flux/schnell" as ModelId, label: "Flux Schnell (10 free daily)", cost: 0 },
  { id: "fal-ai/flux/schnell/redux" as ModelId, label: "Flux Redux (Image to Image)", cost: 1 },
];

export default function Generate() {
  const [selectedType, setSelectedType] = useState(GENERATION_TYPES[0].id);
  const [selectedModel, setSelectedModel] = useState<ModelId>(IMAGE_MODELS[0].id);
  const [credits, setCredits] = useState<number | null>(null);
  const [dailyGenerations, setDailyGenerations] = useState<number>(0);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchCredits();
    if (selectedModel === "fal-ai/flux/schnell") {
      fetchDailyGenerations();
    }
  }, [selectedModel]);

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }
      
      setCredits(data?.amount ?? 0);
    }
  };

  const fetchDailyGenerations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('generations')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('model_name', 'fal-ai/flux/schnell')
        .gte('created_at', today);

      if (error) {
        console.error("Error fetching daily generations:", error);
        return;
      }

      setDailyGenerations(count ?? 0);
    }
  };

  const getModelCost = (modelId: ModelId) => {
    const model = IMAGE_MODELS.find(m => m.id === modelId);
    if (modelId === "fal-ai/flux/schnell") {
      return dailyGenerations < 10 ? 0 : 1;
    }
    return model?.cost ?? 1;
  };

  const handleGenerate = () => {
    setHistoryRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Generate</h1>
              <CreditDisplay credits={credits} modelCost={getModelCost(selectedModel)} />
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
                            <div className="flex flex-col">
                              <span>{model.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {model.id === "fal-ai/flux/schnell" 
                                  ? `${10 - dailyGenerations} free generations remaining today`
                                  : `${model.cost} credits per generation`}
                              </span>
                            </div>
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
                  <GenerateImage 
                    modelId={selectedModel} 
                    dailyGenerations={dailyGenerations}
                    onGenerate={() => {
                      handleGenerate();
                      if (selectedModel === "fal-ai/flux/schnell") {
                        setDailyGenerations(prev => prev + 1);
                      }
                    }}
                  />
                )}
              </Card>
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                <GenerationHistory 
                  type={selectedType} 
                  modelId={selectedModel} 
                  refreshTrigger={historyRefreshTrigger}
                />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}