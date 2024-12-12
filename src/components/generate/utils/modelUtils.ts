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
    cost: 0.0045,
    type: "text-to-image",
    hasFreeDaily: true,
    freeDailyLimit: 10,
    category: "image"
  },
  {
    id: "fal-ai/flux/schnell/redux",
    label: "Schnell Image to Image",
    cost: 0.035,
    type: "image-to-image",
    category: "image"
  },
  {
    id: "fal-ai/stable-audio",
    label: "Stable Audio",
    cost: 1,
    type: "audio",
    category: "audio"
  }
];

export const MODEL_COSTS: Record<ModelId, number> = {
  "fal-ai/flux/schnell": 0.0045,
  "fal-ai/flux/schnell/redux": 0.035,
  "fal-ai/stable-audio": 1
};

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