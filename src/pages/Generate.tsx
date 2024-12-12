import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { Sidebar } from "@/components/feed/Sidebar";
import { ChevronDown, DollarSign, Badge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { ModelId } from "@/types/generation";
import { AVAILABLE_MODELS, getModelInfo, getModelsByCategory } from "@/components/generate/utils/modelUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CreditDisplay } from "@/components/generate/CreditDisplay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Generate() {
  const [selectedModel, setSelectedModel] = useState<ModelId>(AVAILABLE_MODELS[0].id);
  const [credits, setCredits] = useState<number | null>(null);
  const [dailyGenerations, setDailyGenerations] = useState<number>(0);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const isMobile = useIsMobile();
  const modelInfo = getModelInfo(selectedModel);

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

  const renderModelDropdown = (category: "image" | "audio") => (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-sm whitespace-nowrap">
        <span className="text-[hsl(262,83%,74%)]">
          {modelInfo?.label || "Select Model"}
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[300px]">
        {getModelsByCategory(category).map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            className={`flex justify-between items-center ${
              selectedModel === model.id ? "bg-accent" : ""
            }`}
          >
            <span>{model.label}</span>
            <div className="flex items-center gap-2">
              {model.hasFreeDaily && (
                <div className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                  <Badge className="h-3 w-3" />
                  <span>
                    {model.freeDailyLimit - (model.id === "fal-ai/flux/schnell" ? dailyGenerations : 0)} free left
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <DollarSign className="h-3 w-3" />
                <span>{model.cost}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{modelInfo?.label || "Generate"}</h1>
              <CreditDisplay credits={credits} modelCost={modelInfo?.cost} />
            </div>

            <ScrollArea className="w-full">
              <div className="flex items-center gap-4 py-2 px-4 bg-background/95 backdrop-blur-sm border-b border-border/10">
                <Tabs defaultValue="image" className="w-full">
                  <TabsList>
                    <TabsTrigger value="image">Image</TabsTrigger>
                    <TabsTrigger value="audio">Audio</TabsTrigger>
                  </TabsList>
                  <TabsContent value="image" className="mt-0">
                    {renderModelDropdown("image")}
                  </TabsContent>
                  <TabsContent value="audio" className="mt-0">
                    {renderModelDropdown("audio")}
                  </TabsContent>
                </Tabs>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                <GenerateImage 
                  modelId={selectedModel} 
                  dailyGenerations={dailyGenerations}
                  onGenerate={() => {
                    setHistoryRefreshTrigger(prev => prev + 1);
                    if (selectedModel === "fal-ai/flux/schnell") {
                      setDailyGenerations(prev => prev + 1);
                    }
                  }}
                />
              </Card>
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                <GenerationHistory 
                  type={modelInfo?.type || "text-to-image"}
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