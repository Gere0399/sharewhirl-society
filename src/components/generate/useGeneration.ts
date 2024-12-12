import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { fal } from "@fal-ai/client";
import { ModelId, FluxSettings, SchnellSettings, ModelType } from "@/types/generation";
import { Database } from "@/integrations/supabase/types";

const MODEL_COSTS: Record<ModelId, number> = {
  "fal-ai/flux": 1,
  "stabilityai/stable-diffusion-xl-base-1.0": 2,
  "fal-ai/text-to-video-schnell": 1,
  "fal-ai/image-to-video-schnell": 1,
  "fal-ai/flux/schnell": 1
};

const getModelType = (modelId: ModelId): ModelType => {
  if (modelId === "fal-ai/text-to-video-schnell") return "text-to-video";
  if (modelId === "fal-ai/image-to-video-schnell") return "image-to-video";
  if (modelId.includes("flux")) return "flux";
  return "sdxl";
};

type DeductCreditsParams = {
  amount: number;
  user_id: string;
};

interface GetSecretResponse {
  data: string | null;
  error: Error | null;
}

export function useGeneration(modelId: ModelId, dailyGenerations: number, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    fetchCredits();
  }, []);

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

  const getFalKey = async (): Promise<string> => {
    const { data, error } = await supabase.rpc<string>('get_secret', {
      secret_name: 'FAL_KEY'
    });

    if (error) throw new Error("Unable to access FAL AI services");
    if (!data) throw new Error("FAL AI key not found");
    
    return data;
  };

  const handleGenerate = async (settings: FluxSettings | SchnellSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate images");
      }

      const modelCost = MODEL_COSTS[modelId] || 1;
      const isSchnellModel = modelId.includes("schnell");
      
      if (isSchnellModel) {
        if (dailyGenerations >= 10) {
          if (credits === null || credits < 1) {
            throw new Error("You've used all free generations. Please purchase credits to continue.");
          }
        }
      } else if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      const falKey = await getFalKey();
      
      fal.config({
        credentials: falKey
      });

      const result = await fal.subscribe(modelId, {
        input: {
          ...settings,
          scheduler: "K_EULER",
          seed: Math.floor(Math.random() * 1000000),
        },
        pollInterval: 1000,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      if (result.data.images?.[0]?.url || result.data.video?.url) {
        if (!isSchnellModel || dailyGenerations >= 10) {
          const { error: creditError } = await supabase.rpc<void, DeductCreditsParams>('deduct_credits', {
            amount: modelCost,
            user_id: user.id
          });

          if (creditError) throw creditError;
        }

        const { error: generationError } = await supabase.from('generations').insert({
          user_id: user.id,
          model_name: modelId,
          model_type: getModelType(modelId),
          prompt: settings.prompt,
          settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
          output_url: result.data.images?.[0]?.url || result.data.video?.url,
          cost: isSchnellModel && dailyGenerations < 10 ? 0 : modelCost
        });

        if (generationError) throw generationError;

        onGenerate();
        
        if (!isSchnellModel || dailyGenerations >= 10) {
          setCredits(prev => prev !== null ? prev - modelCost : null);
        }

        return {
          success: true,
          message: "Generation successful",
          description: "Your content has been generated and saved to your history.",
        };
      }

      throw new Error("Generation failed");
    } catch (error: any) {
      console.error("Generation error:", error);
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate content. Please check your configuration.",
      };
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    const isSchnellModel = modelId.includes("schnell");
    if (isSchnellModel) {
      return dailyGenerations >= 10 && (credits === null || credits < 1);
    }
    return credits === null || credits < (MODEL_COSTS[modelId] || 1);
  };

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
  };
}