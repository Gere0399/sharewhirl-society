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
  | "fal-ai/speech-to-speech"
  | "fal-ai/flux-pulid";

export type ModelType = "text-to-image" | "image-to-image" | "audio" | "speech" | "consistency";

export interface BaseGenerationSettings {
  prompt?: string;
  image_size?: ImageSize;
  num_images?: number;
  num_inference_steps?: number;
  enable_safety_checker?: boolean;
}

export interface FluxGenerationSettings extends BaseGenerationSettings {
  prompt: string;
  num_inference_steps: number;
  enable_safety_checker: boolean;
}

export interface ReduxSettings extends FluxGenerationSettings {
  image_url: string;
}

export interface StableAudioSettings {
  prompt: string;
  seconds_total: number;
  steps: number;
}

export interface SpeechSettings {
  gen_text: string;
  ref_audio_url: string;
  ref_text?: string;
  model_type: "F5-TTS";
  remove_silence?: boolean;
}

export interface PulidSettings {
  prompt: string;
  reference_image_url: string;
  image_size?: ImageSize;
  num_inference_steps?: number;
  guidance_scale?: number;
  negative_prompt?: string;
  true_cfg?: number;
  id_weight?: number;
  enable_safety_checker?: boolean;
  max_sequence_length?: string;
}

export type GenerationSettings = 
  | FluxGenerationSettings 
  | ReduxSettings 
  | StableAudioSettings 
  | SpeechSettings 
  | PulidSettings;

export interface GenerateImageProps {
  modelId: ModelId;
}