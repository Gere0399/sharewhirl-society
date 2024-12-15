import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult } from "../types";
import { AudioSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export async function generateStableAudio(
  settings: AudioSettings
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

    const storedUrl = await saveToStorage(result.data.audio_file.url, "audio");

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