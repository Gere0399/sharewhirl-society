import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ModelId, SpeechSettings } from "@/types/generation";
import { useCredits } from "./useCredits";
import { getModelInfo } from "../utils/modelUtils";

export function useSpeechGeneration(modelId: ModelId, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();

  const getRequiredCredits = () => {
    const modelInfo = getModelInfo(modelId);
    return modelInfo?.cost || 1;
  };

  const handleGenerate = async (settings: SpeechSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate content");
      }

      const modelInfo = getModelInfo(modelId);
      if (!modelInfo) throw new Error("Invalid model");
      
      const modelCost = getRequiredCredits();
      if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);
      console.log("Starting speech generation with settings:", settings);

      const result = await supabase.functions.invoke('generate-speech', {
        body: { modelId, settings }
      });

      console.log("Speech generation response:", result);

      if (!result.data) {
        throw new Error("No response received from generation function");
      }

      const outputUrl = result.data.data.audio_url;
      if (!outputUrl) {
        throw new Error("No output URL in response");
      }

      // Convert settings to a plain object that matches Json type
      const settingsForDb = {
        gen_text: settings.gen_text,
        ref_text: settings.ref_text,
        audio_url: settings.audio_url,
        model_type: settings.model_type,
        remove_silence: settings.remove_silence
      };

      const { error: creditError } = await supabase
        .from('credits')
        .update({ amount: credits! - modelCost })
        .eq('user_id', user.id);

      if (creditError) throw creditError;

      const { error: generationError } = await supabase.from('generations').insert({
        user_id: user.id,
        model_name: modelId,
        model_type: "speech",
        prompt: settings.gen_text,
        settings: settingsForDb,
        output_url: outputUrl,
        cost: modelCost
      });

      if (generationError) throw generationError;

      onGenerate();
      setCredits(prev => prev !== null ? prev - modelCost : null);

      return {
        success: true,
        message: "Generation successful",
        description: "Your speech has been generated and saved to your history.",
      };
    } catch (error: any) {
      console.error("Speech generation error:", error);
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate speech. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
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