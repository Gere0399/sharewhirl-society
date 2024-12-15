import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult } from "../types";
import { SpeechSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export async function generateSpeech(
  settings: SpeechSettings
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting Speech generation with settings:", settings);

    const result = await supabase.functions.invoke('generate-speech', {
      body: settings
    });

    console.log("Speech generation response:", result);

    if (!result.data?.audio_url) {
      throw new Error("No audio URL in response");
    }

    const storedUrl = await saveToStorage(result.data.audio_url, "speech");

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
  }
}