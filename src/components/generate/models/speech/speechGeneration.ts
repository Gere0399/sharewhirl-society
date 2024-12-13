import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult, BaseGenerationOptions } from "../types";
import { SpeechSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export async function generateWithSpeech(
  settings: SpeechSettings,
  options: BaseGenerationOptions
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting speech generation with settings:", settings);

    const { data, error } = await supabase.functions.invoke('generate-speech', {
      body: {
        gen_text: settings.input_text,
        audio_url: settings.audio_url,
        model_type: settings.model_type,
        remove_silence: settings.remove_silence
      }
    });

    if (error) throw error;
    if (!data?.data?.audio_url?.url) throw new Error("No audio URL in response");

    const outputUrl = await saveToStorage(data.data.audio_url.url, options.modelType);

    const { error: dbError } = await supabase.from('generations').insert({
      user_id: options.userId,
      model_name: options.modelId,
      model_type: options.modelType,
      prompt: settings.input_text,
      settings: JSON.parse(JSON.stringify(settings)),
      output_url: outputUrl,
    });

    if (dbError) throw dbError;

    options.onSuccess?.();

    return {
      success: true,
      message: "Speech generated successfully",
      description: "Your speech has been generated and saved.",
    };
  } catch (error: any) {
    console.error("Speech generation error:", error);
    return {
      success: false,
      message: "Speech generation failed",
      description: error.message || "Failed to generate speech. Please try again.",
    };
  }
}