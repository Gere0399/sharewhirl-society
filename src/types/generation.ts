export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type SafetyTolerance = "1" | "2" | "3" | "4" | "5";

export interface GenerationSettings {
  prompt: string;
  num_inference_steps: number;
  guidance_scale: number;
  image_size: ImageSize;
  safety_tolerance: SafetyTolerance;
  num_images: number;
}

export interface GenerateImageProps {
  modelId: string;
}