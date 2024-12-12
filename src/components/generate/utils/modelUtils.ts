import { ModelId, ModelType } from "@/types/generation";
import { DollarSign, Badge } from "lucide-react";

export interface ModelInfo {
  id: ModelId;
  label: string;
  cost: number;
  type: ModelType;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  category: "image" | "audio";
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "fal-ai/flux/schnell",
    label: "Schnell Text to Image",
    cost: 1,  // We'll store costs as integers (credits) instead of decimals
    type: "text-to-image",
    hasFreeDaily: true,
    freeDailyLimit: 10,
    category: "image"
  },
  {
    id: "fal-ai/flux/schnell/redux",
    label: "Schnell Image to Image",
    cost: 35, // We'll store costs as integers (credits) instead of decimals
    type: "image-to-image",
    category: "image"
  },
  {
    id: "fal-ai/stable-audio",
    label: "Stable Audio",
    cost: 100,
    type: "audio",
    category: "audio"
  }
];

export const getModelInfo = (modelId: ModelId): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === modelId);
};

export const getModelType = (modelId: ModelId): ModelType => {
  const model = getModelInfo(modelId);
  return model?.type || "text-to-image";
};

export const getModelsByCategory = (category: "image" | "audio") => {
  return AVAILABLE_MODELS.filter(model => model.category === category);
};