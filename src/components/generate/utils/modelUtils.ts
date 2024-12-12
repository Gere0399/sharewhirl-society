import { ModelId, ModelType } from "@/types/generation";

export const MODEL_COSTS: Record<ModelId, number> = {
  "fal-ai/flux": 1,
  "stabilityai/stable-diffusion-xl-base-1.0": 2,
  "fal-ai/text-to-video-schnell": 1,
  "fal-ai/image-to-video-schnell": 1,
  "fal-ai/flux/schnell": 1,
  "fal-ai/flux/schnell/redux": 1
};

export const getModelType = (modelId: ModelId): ModelType => {
  if (modelId === "fal-ai/text-to-video-schnell") return "text-to-video";
  if (modelId === "fal-ai/image-to-video-schnell") return "image-to-video";
  if (modelId === "fal-ai/flux/schnell/redux") return "image-to-image";
  if (modelId.includes("flux")) return "flux";
  return "sdxl";
};