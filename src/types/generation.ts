export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type ModelId = 
  | "fal-ai/flux"
  | "stabilityai/stable-diffusion-xl-base-1.0"
  | "fal-ai/text-to-video-schnell"
  | "fal-ai/image-to-video-schnell";

export interface BaseGenerationSettings {
  prompt: string;
  image_size: ImageSize;
  num_images: number;
  num_inference_steps: number;
}

export interface FluxSettings extends BaseGenerationSettings {
  guidance_scale: number;
  safety_tolerance?: string;
}

export interface SchnellSettings extends BaseGenerationSettings {
  enable_safety_checker: boolean;
  seed?: number;
}

export interface GenerateImageProps {
  modelId: ModelId;
}

export type ModelType = "flux" | "sdxl" | "text-to-video" | "image-to-video";

export interface ImageModel {
  id: ModelId;
  label: string;
  type: ModelType;
  cost: number;
}

// Helper type for Supabase compatibility
export type GenerationSettings = {
  [K in keyof (FluxSettings & SchnellSettings)]?: (FluxSettings & SchnellSettings)[K];
}