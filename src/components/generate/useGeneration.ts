import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelId, GenerationSettings } from "@/types/generation";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { getModelInfo, getModelType } from "./utils/modelUtils";
import { generateWithSchnell, SchnellSettings } from "./models/schnell/schnellGeneration";
import { generateWithStableAudio, StableAudioSettings } from "./models/audio/stableAudioGeneration";

export function useGeneration(modelId: ModelId, dailyGenerations: number, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();

  const getRequiredCredits = () => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.cost || 1;
  };

  const handleGenerate = async (settings: GenerationSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate content");
      }

      const modelInfo = getModelInfo(modelId);
      if (!modelInfo) throw new Error("Invalid model");
      
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

      let result;
      const modelType = getModelType(modelId);
      const baseOptions = {
        userId: user.id,
        modelId,
        modelType,
        onSuccess: () => {
          onGenerate();
          if (!isSchnellModel || dailyGenerations >= 10) {
            setCredits(prev => prev !== null ? prev - modelCost : null);
          }
        }
      };

      if (modelType === "audio") {
        result = await generateWithStableAudio(settings as StableAudioSettings, baseOptions);
      } else {
        result = await generateWithSchnell(settings as SchnellSettings, baseOptions);
      }

      return result;
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
      return dailyGenerations >= 10 && (credits === null || credits < getRequiredCredits());
    }
    return credits === null || credits < getRequiredCredits();
  };

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
    getRequiredCredits,
  };
}