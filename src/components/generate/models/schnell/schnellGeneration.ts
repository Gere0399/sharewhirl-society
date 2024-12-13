import { supabase } from "@/integrations/supabase/client";
import { BaseGenerationResult, BaseGenerationOptions } from "../types";
import { SchnellSettings } from "@/types/generation";
import { saveToStorage } from "../../utils/storageUtils";

export interface SchnellGenerationSettings {
  prompt?: string;
  image_size?: string;
  num_images?: number;
  num_inference_steps: number;
  enable_safety_checker: boolean;
}

export async function generateWithSchnell(
  settings: SchnellSettings,
  options: BaseGenerationOptions
): Promise<BaseGenerationResult> {
  try {
    console.log("Starting Schnell generation with settings:", settings);

    const { data, error } = await supabase.functions.invoke('generate-flux-image', {
      body: settings
    });

    if (error) throw error;
    if (!data?.image_url) throw new Error("No image URL in response");

    const outputUrl = await saveToStorage(data.image_url, options.modelType);

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
      message: "Image generated successfully",
      description: "Your image has been generated and saved.",
    };
  } catch (error: any) {
    console.error("Schnell generation error:", error);
    return {
      success: false,
      message: "Image generation failed",
      description: error.message || "Failed to generate image. Please try again.",
    };
  }
}