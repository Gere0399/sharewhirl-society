import { ModelType } from "@/types/generation";

export interface BaseGenerationResult {
  success: boolean;
  message: string;
  description: string;
}

export interface BaseGenerationOptions {
  modelId: string;
  modelType: ModelType;
  settings: any;
}