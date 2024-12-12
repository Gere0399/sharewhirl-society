import { ModelId, ModelType } from "@/types/generation";
import { DollarSign, Badge } from "lucide-react";

export interface ModelInfo {
  id: ModelId;
  label: string;
  cost: number;
  type: ModelType;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: "fal-ai/flux/schnell",
    label: "Schnell Text to Image",
    cost: 1,
    type: "text-to-image",
    hasFreeDaily: true,
    freeDailyLimit: 10
  },
  {
    id: "fal-ai/flux/schnell/redux",
    label: "Schnell Image to Image",
    cost: 1,
    type: "image-to-image"
  }
];

export const MODEL_COSTS: Record<ModelId, number> = {
  "fal-ai/flux/schnell": 1,
  "fal-ai/flux/schnell/redux": 1
};

export const getModelInfo = (modelId: ModelId): ModelInfo | undefined => {
  return AVAILABLE_MODELS.find(model => model.id === modelId);
};

export const getModelType = (modelId: ModelId): ModelType => {
  const model = getModelInfo(modelId);
  return model?.type || "text-to-image";
};

export const getModelCost = (modelId: ModelId, dailyGenerations: number = 0): number => {
  const model = getModelInfo(modelId);
  if (!model) return 1;
  
  if (model.hasFreeDaily && dailyGenerations < (model.freeDailyLimit || 0)) {
    return 0;
  }
  return model.cost;
};