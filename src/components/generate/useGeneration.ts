import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelId, GenerationSettings } from "@/types/generation";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { getModelInfo, getModelType } from "./utils/modelUtils";
import { generateWithFlux } from "./models/flux/fluxModels";
import { generateStableAudio } from "./models/audio/stableAudio";
import { generateSpeech } from "./models/speech/speechModel";
import { Database } from "@/integrations/supabase/types";

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
      console.log("Starting generation with settings:", settings);

      let result;
      const modelType = getModelType(modelId);

      // Call the appropriate model generation function
      if (modelId.includes('flux') || modelId.includes('schnell')) {
        result = await generateWithFlux(modelId, settings);
      } else if (modelType === 'audio') {
        result = await generateStableAudio(settings);
      } else if (modelType === 'speech') {
        result = await generateSpeech(settings);
      } else {
        throw new Error("Unsupported model type");
      }

      if (result.success) {
        if (!isSchnellModel || dailyGenerations >= 10) {
          const { error: creditError } = await supabase
            .from('credits')
            .update({ amount: credits! - modelCost })
            .eq('user_id', user.id);

          if (creditError) throw creditError;
        }

        // Get the prompt based on the settings type
        let promptValue = '';
        if ('prompt' in settings) {
          promptValue = settings.prompt;
        } else if ('gen_text' in settings) {
          promptValue = settings.gen_text;
        }

        const { error: generationError } = await supabase.from('generations').insert({
          user_id: user.id,
          model_name: modelId,
          model_type: modelType,
          prompt: promptValue,
          settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
          output_url: result.output_url,
          cost: isSchnellModel && dailyGenerations < 10 ? 0 : modelCost
        });

        if (generationError) throw generationError;

        onGenerate();
        
        if (!isSchnellModel || dailyGenerations >= 10) {
          setCredits(prev => prev !== null ? prev - modelCost : null);
        }
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