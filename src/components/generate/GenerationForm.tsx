import { ModelType, GenerationSettings } from "@/types/generation";
import { ImageGenerationForm } from "./form/ImageGenerationForm";
import { AudioGenerationForm } from "./form/AudioGenerationForm";
import { SpeechGenerationForm } from "./form/SpeechGenerationForm";

interface GenerationFormProps {
  onSubmit: (settings: GenerationSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function GenerationForm({ 
  onSubmit, 
  loading, 
  disabled, 
  modelType, 
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: GenerationFormProps) {
  const commonProps = {
    onSubmit,
    loading,
    disabled,
    modelCost,
    hasFreeDaily,
    freeDailyLimit,
    dailyGenerations
  };

  switch (modelType) {
    case "audio":
      return <AudioGenerationForm {...commonProps} />;
    case "speech":
      return <SpeechGenerationForm {...commonProps} />;
    default:
      return <ImageGenerationForm {...commonProps} modelType={modelType} />;
  }
}