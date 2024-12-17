import { ModelType, GenerationSettings } from "@/types/generation";
import { ImageGenerationForm } from "./form/ImageGenerationForm";
import { AudioGenerationForm } from "./form/AudioGenerationForm";
import { SpeechGenerationForm } from "./form/SpeechGenerationForm";
import { PulidModel } from "./models/consistency/PulidModel";

interface GenerationFormProps {
  onSubmit: (settings: GenerationSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
  onSuccess?: () => void;
}

export function GenerationForm({ 
  onSubmit, 
  loading, 
  disabled, 
  modelType, 
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0,
  onSuccess
}: GenerationFormProps) {
  const commonProps = {
    onSubmit,
    loading,
    disabled,
    modelCost,
    hasFreeDaily,
    freeDailyLimit,
    dailyGenerations,
    onSuccess
  };

  switch (modelType) {
    case "audio":
      return <AudioGenerationForm {...commonProps} />;
    case "speech":
      return <SpeechGenerationForm {...commonProps} />;
    case "consistency":
      return <PulidModel {...commonProps} />;
    default:
      return <ImageGenerationForm {...commonProps} modelType={modelType} />;
  }
}