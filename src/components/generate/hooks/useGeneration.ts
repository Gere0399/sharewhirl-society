import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelId, GenerationSettings } from "@/types/generation";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { useFalAI } from "@/components/generate/hooks/useFalAI";
import { getModelInfo, getModelType } from "../utils/modelUtils";
import { Database } from "@/integrations/supabase/types";

export function useGeneration(modelId: ModelId, dailyGenerations: number, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();
  const { generateWithFalAI } = useFalAI();

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

      try {
        let result;
        
        if (modelId === 'fal-ai/flux-pulid') {
          console.log("Using Pulid endpoint with settings:", settings);
          result = await supabase.functions.invoke('generate-pulid-image', {
            body: { settings }
          });
          console.log("Pulid response:", result);
        } else if (modelId.includes('flux')) {
          result = await supabase.functions.invoke('generate-flux-image', {
            body: { modelId, settings }
          });
        } else {
          result = await supabase.functions.invoke('generate-image', {
            body: { modelId, settings }
          });
        }

        console.log("Generation response received:", result);

        if (!result.data) {
          console.error("Empty response received:", result);
          throw new Error("No response received from generation function");
        }

        // Extract the output URL from the response
        let outputUrl;
        if (result.data.images?.[0]?.url) {
          outputUrl = result.data.images[0].url;
        } else {
          console.error("Response structure:", result.data);
          throw new Error("No output URL in response");
        }

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
          model_type: getModelType(modelId),
          prompt: promptValue,
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
          description: "Your content has been generated and saved to your history.",
        };
      } catch (error: any) {
        console.error("Generation error:", error);
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