export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type SafetyTolerance = "1" | "2" | "3" | "4" | "5";

export interface BaseGenerationSettings {
  prompt: string;
  image_size: ImageSize;
  num_images: number;
}

export interface FluxSettings extends BaseGenerationSettings {
  num_inference_steps: number;
  guidance_scale: number;
  safety_tolerance: SafetyTolerance;
}

export interface FluxSchnellSettings extends BaseGenerationSettings {
  num_inference_steps: number;
  enable_safety_checker: boolean;
  seed?: number;
}

export interface GenerateImageProps {
  modelId: string;
}

export type ModelType = "flux" | "sdxl" | "flux-schnell";

export interface ImageModel {
  id: string;
  label: string;
  type: ModelType;
  cost: number;
}