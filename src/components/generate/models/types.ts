import { ModelType } from "@/types/generation";

export interface BaseGenerationResult {
  success: boolean;
  message: string;
  description: string;
}

export interface BaseGenerationOptions {
  userId: string;
  modelId: string;
  modelType: ModelType;
  onSuccess?: () => void;
}