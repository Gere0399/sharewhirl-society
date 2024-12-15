import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { BaseGenerationResult } from "../types";
import { saveToStorage } from "../../utils/storageUtils";
import { Database } from "@/integrations/supabase/types";

export interface StableAudioSettings {
  prompt: string;
  seconds_total: number;
  steps: number;
}

export function useStableAudioGeneration(modelId: string, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();
  
  const getRequiredCredits = () => 100;

  const isDisabled = () => {
    return credits === null || credits < getRequiredCredits();
  };

  const handleGenerate = async (settings: StableAudioSettings): Promise<BaseGenerationResult> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate content");
      }

      const modelCost = getRequiredCredits();
      if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);
      console.log("Starting Stable Audio generation with settings:", settings);

      const result = await supabase.functions.invoke('generate-stable-audio', {
        body: settings
      });

      if (!result.data?.audio_file?.url) {
        throw new Error("No audio URL in response");
      }

      const outputUrl = await saveToStorage(result.data.audio_file.url, "audio");

      const { error: creditError } = await supabase
        .from('credits')
        .update({ amount: credits - modelCost })
        .eq('user_id', user.id);

      if (creditError) throw creditError;

      const { error: generationError } = await supabase.from('generations').insert({
        user_id: user.id,
        model_name: modelId,
        model_type: "audio",
        prompt: settings.prompt,
        settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
        output_url: outputUrl,
        cost: modelCost
      });

      if (generationError) throw generationError;

      onGenerate();
      setCredits(prev => prev !== null ? prev - modelCost : null);

      return {
        success: true,
        message: "Generation successful",
        description: "Your audio has been generated and saved to your history.",
      };

    } catch (error: any) {
      console.error("Stable Audio generation error:", error);
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate audio. Please try again.",
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