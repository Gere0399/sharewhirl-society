import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelId, FluxSettings, SchnellSettings } from "@/types/generation";
import { useCredits } from "./useCredits";
import { useFalAI } from "./useFalAI";
import { MODEL_COSTS, getModelType } from "../utils/modelUtils";
import { saveToStorage } from "../utils/storageUtils";
import { Database } from "@/integrations/supabase/types";

export function useGeneration(modelId: ModelId, dailyGenerations: number, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();
  const { generateWithFalAI } = useFalAI();

  const getRequiredCredits = () => {
    const isSchnellModel = modelId.includes("schnell");
    if (isSchnellModel) {
      return dailyGenerations >= 10 ? 1 : 0;
    }
    return MODEL_COSTS[modelId] || 1;
  };

  const handleGenerate = async (settings: FluxSettings | SchnellSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate images");
      }

      const modelCost = getRequiredCredits();
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
      console.log("Starting generation with settings:", settings);

      try {
        const result = await generateWithFalAI(modelId, settings);
        console.log("FAL AI response received:", result);

        if (!result.data.images?.[0]?.url) {
          throw new Error("No output URL in response from FAL AI");
        }

        const outputUrl = result.data.images[0].url;
        const storedUrl = await saveToStorage(outputUrl, getModelType(modelId));

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
          model_type: getModelType(modelId),
          prompt: settings.prompt,
          settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
          output_url: storedUrl,
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
      } catch (error: any) {
        console.error("FAL AI error:", error);
        if (error.message?.includes("ValidationError")) {
          throw new Error("Invalid generation settings. Please check your input and try again.");
        }
        if (error.message?.includes("Load failed")) {
          throw new Error("Generation timed out. Please try again.");
        }
        throw error;
      }
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
    getRequiredCredits,
  };
}