import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenerateImageProps, FluxSettings, FluxSchnellSettings, ModelType } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MODEL_COSTS = {
  "fal-ai/flux": 1,
  "stabilityai/stable-diffusion-xl-base-1.0": 2,
  "fal-ai/flux/schnell": 0,
};

export function GenerateImage({ modelId }: GenerateImageProps) {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [dailyGenerations, setDailyGenerations] = useState<number>(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredits();
    if (modelId === "fal-ai/flux/schnell") {
      fetchDailyGenerations();
    }
  }, [modelId]);

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

  const fetchDailyGenerations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('generations')
        .select('id')
        .eq('user_id', user.id)
        .eq('model_name', 'fal-ai/flux/schnell')
        .gte('created_at', today)
        .count();
      setDailyGenerations(data ?? 0);
    }
  };

  const getModelType = (modelId: string): ModelType => {
    if (modelId.includes("flux/schnell")) return "flux-schnell";
    if (modelId.includes("flux")) return "flux";
    return "sdxl";
  };

  const handleGenerate = async (settings: FluxSettings | FluxSchnellSettings) => {
    try {
      const modelCost = MODEL_COSTS[modelId as keyof typeof MODEL_COSTS] || 1;
      
      if (modelId === "fal-ai/flux/schnell") {
        if (dailyGenerations >= 10) {
          if (credits === null || credits < 1) {
            throw new Error("You've used all free generations. Please purchase credits to continue.");
          }
        }
      } else if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      const result = await fal.subscribe(modelId, {
        input: settings,
        logs: true,
      });

      if (result.data.images?.[0]?.url) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Deduct credits if not using free generations
          if (modelId !== "fal-ai/flux/schnell" || dailyGenerations >= 10) {
            const { error: creditError } = await supabase.rpc('deduct_credits', {
              amount: modelCost,
              user_id: user.id
            });

            if (creditError) throw creditError;
          }

          // Save generation
          await supabase.from("generations").insert({
            user_id: user.id,
            model_name: modelId,
            model_type: "image",
            prompt: settings.prompt,
            settings: settings as any,
            output_url: result.data.images[0].url,
            cost: modelId === "fal-ai/flux/schnell" && dailyGenerations < 10 ? 0 : modelCost
          });

          // Update local states
          if (modelId === "fal-ai/flux/schnell") {
            setDailyGenerations(prev => prev + 1);
          }
          if (modelId !== "fal-ai/flux/schnell" || dailyGenerations >= 10) {
            setCredits(prev => prev !== null ? prev - modelCost : null);
          }
        }

        toast({
          title: "Image generated successfully",
          description: "Your image has been generated and saved to your history.",
        });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    if (modelId === "fal-ai/flux/schnell") {
      return dailyGenerations >= 10 && (credits === null || credits < 1);
    }
    return credits === null || credits < (MODEL_COSTS[modelId as keyof typeof MODEL_COSTS] || 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Generate Image</h2>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Subscriptions
        </Button>
      </div>

      {modelId === "fal-ai/flux/schnell" && (
        <div className="text-sm text-muted-foreground">
          {10 - dailyGenerations} free generations remaining today
        </div>
      )}

      <GenerationForm
        onSubmit={handleGenerate}
        loading={loading}
        disabled={isDisabled()}
        modelType={getModelType(modelId)}
      />
    </div>
  );
}