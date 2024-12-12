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
  | "fal-ai/image-to-video-schnell"
  | "fal-ai/flux/schnell"
  | "fal-ai/flux/schnell/redux";

export interface BaseGenerationSettings {
  prompt?: string;
  image_size: ImageSize;
  num_images: number;
  num_inference_steps: number;
  enable_safety_checker: boolean;
}

export interface FluxSettings extends BaseGenerationSettings {
  guidance_scale: number;
  safety_tolerance?: string;
}

export interface SchnellSettings extends BaseGenerationSettings {
}

export interface ReduxSettings extends BaseGenerationSettings {
  image_url?: string;
  file?: File;
}

export interface GenerateImageProps {
  modelId: ModelId;
}

export type ModelType = "flux" | "sdxl" | "text-to-video" | "image-to-video" | "image-to-image";

// Helper type for Supabase compatibility
export type GenerationSettings = {
  [K in keyof (FluxSettings & SchnellSettings & ReduxSettings)]?: (FluxSettings & SchnellSettings & ReduxSettings)[K];
}