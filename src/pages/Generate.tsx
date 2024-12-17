import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { Sidebar } from "@/components/feed/Sidebar";
import { ChevronDown, DollarSign, Badge } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { ModelId } from "@/types/generation";
import { AVAILABLE_MODELS, getModelInfo, CATEGORIES } from "@/components/generate/utils/modelUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CreditDisplay } from "@/components/generate/CreditDisplay";

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                {modelInfo?.label || "Generate"}
              </h1>
              <CreditDisplay credits={credits} />
            </div>

            <div className="bg-black/5 backdrop-blur-lg border border-white/10 rounded-lg p-4 mb-6">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-md bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-[hsl(262,83%,74%)]">
                    {CATEGORIES.find(cat => cat.id === modelInfo?.category)?.label || "Select Category"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[hsl(262,83%,74%)]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[300px] bg-background/95 backdrop-blur-sm border border-white/10">
                  {CATEGORIES.map((category) => {
                    const models = AVAILABLE_MODELS.filter(model => model.category === category.id);
                    if (models.length === 0) return null;

                    return (
                      <div key={category.id} className="py-2">
                        <div className="px-2 text-sm font-semibold text-muted-foreground mb-1">
                          {category.label}
                        </div>
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model.id}
                            onClick={() => setSelectedModel(model.id)}
                            className={`flex justify-between items-center px-2 py-1.5 ${
                              selectedModel === model.id ? "bg-accent" : ""
                            }`}
                          >
                            <span>{model.label}</span>
                            <div className="flex items-center gap-2">
                              {model.hasFreeDaily && (
                                <div className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                                  <Badge className="h-3 w-3" />
                                  <span>
                                    {model.freeDailyLimit - (model.id === "fal-ai/flux/schnell" ? dailyGenerations : 0)} free
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
                      </div>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 overflow-x-hidden bg-black/5 backdrop-blur-lg border border-white/10">
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
              <Card className="p-6 overflow-x-hidden bg-black/5 backdrop-blur-lg border border-white/10">
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