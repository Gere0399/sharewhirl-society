export type ImageSize = 
  | "square_hd"
  | "square"
  | "portrait_4_3"
  | "portrait_16_9"
  | "landscape_4_3"
  | "landscape_16_9";

export type ModelId = 
  | "fal-ai/flux/schnell"
  | "fal-ai/flux/schnell/redux"
  | "fal-ai/stable-audio"
  | "fal-ai/speech-to-speech";

export type ModelType = "text-to-image" | "image-to-image" | "audio" | "speech";

export interface BaseGenerationSettings {
  [key: string]: string | number | boolean | undefined;
}

export interface SchnellSettings extends BaseGenerationSettings {
  prompt?: string;
  image_size?: ImageSize;
  num_images?: number;
  num_inference_steps: number;
  enable_safety_checker: boolean;
}

export interface AudioSettings extends BaseGenerationSettings {
  prompt: string;
  seconds_total: number;
  steps: number;
}

export interface SpeechSettings extends BaseGenerationSettings {
  input_text: string;
  audio_url: string;
  model_type: string;
  remove_silence?: boolean;
}

export type GenerationSettings = SchnellSettings | AudioSettings | SpeechSettings;