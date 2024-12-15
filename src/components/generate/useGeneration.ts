import { ModelId, GenerationSettings } from "@/types/generation";
import { getModelType } from "./utils/modelUtils";
import { useFluxGeneration } from "./models/flux/FluxModel";
import { useStableAudioGeneration } from "./models/audio/StableAudioModel";
import { useSpeechGeneration } from "./models/speech/SpeechModel";

export function useGeneration(modelId: ModelId, dailyGenerations: number, onGenerate: () => void) {
  const fluxGeneration = useFluxGeneration(modelId, dailyGenerations, onGenerate);
  const stableAudioGeneration = useStableAudioGeneration(modelId, onGenerate);
  const speechGeneration = useSpeechGeneration(modelId, onGenerate);

  const modelType = getModelType(modelId);

  const getRequiredCredits = () => {
    switch (modelType) {
      case "audio":
        return stableAudioGeneration.getRequiredCredits();
      case "speech":
        return speechGeneration.getRequiredCredits();
      default:
        return fluxGeneration.getRequiredCredits();
    }
  };

  const isDisabled = () => {
    switch (modelType) {
      case "audio":
        return stableAudioGeneration.isDisabled();
      case "speech":
        return speechGeneration.isDisabled();
      default:
        return fluxGeneration.isDisabled();
    }
  };

  const handleGenerate = async (settings: GenerationSettings) => {
    switch (modelType) {
      case "audio":
        return stableAudioGeneration.handleGenerate(settings);
      case "speech":
        return speechGeneration.handleGenerate(settings);
      default:
        return fluxGeneration.handleGenerate(settings);
    }
  };

  const loading = modelType === "audio" 
    ? stableAudioGeneration.loading 
    : modelType === "speech" 
      ? speechGeneration.loading 
      : fluxGeneration.loading;

  const credits = modelType === "audio"
    ? stableAudioGeneration.credits
    : modelType === "speech"
      ? speechGeneration.credits
      : fluxGeneration.credits;

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
    getRequiredCredits,
  };
}