export interface BaseGenerationResult {
  success: boolean;
  message: string;
  description: string;
  output_url?: string;
}

export interface BaseGenerationOptions {
  modelId: string;
  settings: any;
}