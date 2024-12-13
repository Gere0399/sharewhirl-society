import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult, BaseGenerationOptions } from "../types";
import { AudioSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export interface StableAudioSettings extends AudioSettings {
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

    const { data, error } = await supabase.functions.invoke('generate-stable-audio', {
      body: settings
    });

    if (error) throw error;
    if (!data?.audio_url) throw new Error("No audio URL in response");

    const outputUrl = await saveToStorage(data.audio_url, options.modelType);

    const { error: dbError } = await supabase.from('generations').insert({
      user_id: options.userId,
      model_name: options.modelId,
      model_type: options.modelType,
      prompt: settings.prompt,
      settings: JSON.parse(JSON.stringify(settings)),
      output_url: outputUrl,
    });

    if (dbError) throw dbError;

    options.onSuccess?.();

    return {
      success: true,
      message: "Audio generated successfully",
      description: "Your audio has been generated and saved.",
    };
  } catch (error: any) {
    console.error("Stable Audio generation error:", error);
    return {
      success: false,
      message: "Audio generation failed",
      description: error.message || "Failed to generate audio. Please try again.",
    };
  }
}