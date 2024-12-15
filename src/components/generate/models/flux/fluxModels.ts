import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult } from "../types";
import { FluxGenerationSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export async function generateWithFlux(
  modelId: string,
  settings: FluxGenerationSettings
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting Flux generation with settings:", settings);

    const result = await supabase.functions.invoke('generate-flux-image', {
      body: { modelId, settings }
    });

    console.log("Flux generation response:", result);

    if (!result.data) {
      throw new Error("No response received from generation function");
    }

    if (!result.data.data.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    const storedUrl = await saveToStorage(result.data.data.images[0].url, "text-to-image");

    return {
      success: true,
      message: "Generation successful",
      description: "Your image has been generated and saved to your history.",
    };
  } catch (error: any) {
    console.error("Flux generation error:", error);
    return {
      success: false,
      message: "Generation failed",
      description: error.message || "Failed to generate image. Please try again.",
    };
  }
}