import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult, BaseGenerationOptions } from "../types";
import { saveToStorage } from "../../utils/storageUtils";
import { SchnellSettings } from "@/types/generation";

export async function generateWithSchnell(
  settings: SchnellSettings,
  options: BaseGenerationOptions
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting Schnell generation with settings:", settings);

    const result = await supabase.functions.invoke('generate-flux-image', {
      body: { modelId: options.modelId, settings }
    });

    console.log("Schnell generation response:", result);

    if (!result.data) {
      throw new Error("No response received from generation function");
    }

    if (!result.data.data.images?.[0]?.url) {
      throw new Error("No image URL in response");
    }

    const outputUrl = await saveToStorage(result.data.data.images[0].url, options.modelType);

    const { error: generationError } = await supabase.from('generations').insert({
      user_id: options.userId,
      model_name: options.modelId,
      model_type: options.modelType,
      prompt: settings.prompt,
      settings: settings as unknown as Record<string, unknown>,
      output_url: outputUrl,
    });

    if (generationError) throw generationError;

    options.onSuccess?.();

    return {
      success: true,
      message: "Generation successful",
      description: "Your image has been generated and saved to your history.",
    };
  } catch (error: any) {
    console.error("Schnell generation error:", error);
    return {
      success: false,
      message: "Generation failed",
      description: error.message || "Failed to generate image. Please try again.",
    };
  }
}