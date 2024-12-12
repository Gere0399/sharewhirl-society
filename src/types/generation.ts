export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type ModelId = 
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

export interface SchnellSettings extends BaseGenerationSettings {
}

export interface ReduxSettings extends BaseGenerationSettings {
  image_url?: string;
}

export interface GenerateImageProps {
  modelId: ModelId;
}

export type ModelType = "text-to-video" | "image-to-video" | "image-to-image" | "text-to-image";