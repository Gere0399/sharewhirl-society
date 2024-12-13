import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult, BaseGenerationOptions } from "../types";
import { saveToStorage } from "../../utils/storageUtils";

export interface StableAudioSettings {
  prompt: string;
  seconds_total: number;
  steps: number;
}

export async function generateWithStableAudio(
  settings: StableAudioSettings,
  options: BaseGenerationOptions
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting Stable Audio generation with settings:", settings);

    const result = await supabase.functions.invoke('generate-stable-audio', {
      body: settings
    });

    console.log("Stable Audio response:", result);

    if (!result.data?.audio_file?.url) {
      throw new Error("No audio URL in response");
    }

    const outputUrl = await saveToStorage(result.data.audio_file.url, options.modelType);

    const { error: generationError } = await supabase.from('generations').insert({
      user_id: options.userId,
      model_name: options.modelId,
      model_type: options.modelType,
      prompt: settings.prompt,
      settings,
      output_url: outputUrl,
    });

    if (generationError) throw generationError;

    options.onSuccess?.();

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
  }
}