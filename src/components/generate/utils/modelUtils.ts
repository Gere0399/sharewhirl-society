import { ModelId, ModelType } from "@/types/generation";
import { DollarSign, Badge } from "lucide-react";

export interface ModelInfo {
  id: ModelId;
  label: string;
  cost: number;
  type: ModelType;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  category: "consistency" | "image" | "video" | "audio" | "speech";
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "fal-ai/flux-pulid",
    label: "Pulid Consistency",
    cost: 50,
    type: "consistency",
    category: "consistency"
  },
  {
    id: "fal-ai/flux/schnell",
    label: "Schnell Text to Image",
    cost: 1,
    type: "text-to-image",
    hasFreeDaily: true,
    freeDailyLimit: 10,
    category: "image"
  },
  {
    id: "fal-ai/flux/schnell/redux",
    label: "Schnell Image to Image",
    cost: 35,
    type: "image-to-image",
    category: "image"
  },
  {
    id: "fal-ai/stable-audio",
    label: "Stable Audio",
    cost: 100,
    type: "audio",
    category: "audio"
  },
  {
    id: "fal-ai/speech-to-speech",
    label: "Speech to Speech",
    cost: 150,
    type: "speech",
    category: "speech"
  }
];

export const getModelInfo = (modelId: ModelId): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === modelId);
};

export const getModelType = (modelId: ModelId): ModelType => {
  const model = getModelInfo(modelId);
  return model?.type || "text-to-image";
};

export const getModelsByCategory = (category: ModelInfo['category']) => {
  return AVAILABLE_MODELS.filter(model => model.category === category);
};

export const CATEGORIES = [
  { id: "consistency", label: "Consistency" },
  { id: "image", label: "Images" },
  { id: "video", label: "Video" },
  { id: "audio", label: "Audio" },
  { id: "speech", label: "Speech" }
] as const;
