import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { BaseGenerationResult } from "../types";
import { saveToStorage } from "../../utils/storageUtils";
import { Database } from "@/integrations/supabase/types";

export interface FluxGenerationSettings {
  prompt: string;
  image_size?: string;
  num_inference_steps: number;
  enable_safety_checker: boolean;
  image_url?: string;
}

export function useFluxGeneration(modelId: string, dailyGenerations: number, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();
  
  const getRequiredCredits = () => {
    return modelId.includes("redux") ? 35 : 1;
  };

  const isDisabled = () => {
    const isSchnellModel = modelId.includes("schnell");
    if (isSchnellModel) {
      return dailyGenerations >= 10 && (credits === null || credits < getRequiredCredits());
    }
    return credits === null || credits < getRequiredCredits();
  };

  const handleGenerate = async (settings: FluxGenerationSettings): Promise<BaseGenerationResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate content");
      }

      const modelCost = getRequiredCredits();
      const isSchnellModel = modelId.includes("schnell");
      
      if (isSchnellModel) {
        if (dailyGenerations >= 10) {
          if (credits === null || credits < modelCost) {
            throw new Error("You've used all free generations. Please purchase credits to continue.");
          }
        }
      } else if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);
      console.log("Starting Flux generation with settings:", settings);

      const result = await supabase.functions.invoke('generate-flux-image', {
        body: { modelId, settings }
      });

      if (!result.data?.data?.images?.[0]?.url) {
        throw new Error("No image URL in response");
      }

      const outputUrl = await saveToStorage(result.data.data.images[0].url, "text-to-image");

      if (!isSchnellModel || dailyGenerations >= 10) {
        const { error: creditError } = await supabase
          .from('credits')
          .update({ amount: credits! - modelCost })
          .eq('user_id', user.id);

        if (creditError) throw creditError;
      }

      const { error: generationError } = await supabase.from('generations').insert({
        user_id: user.id,
        model_name: modelId,
        model_type: "text-to-image",
        prompt: settings.prompt,
        settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
        output_url: outputUrl,
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
        description: "Your image has been generated and saved to your history.",
      };

    } catch (error: any) {
      console.error("Flux generation error:", error);
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate image. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
    getRequiredCredits,
  };
}