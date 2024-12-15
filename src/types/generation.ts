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

export type GenerationSettings = FluxGenerationSettings | ReduxSettings | StableAudioSettings | SpeechSettings;

export interface GenerateImageProps {
  modelId: ModelId;
}
