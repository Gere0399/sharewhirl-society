import { useToast } from "@/hooks/use-toast";
import { GenerateImageProps } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { useGeneration } from "./useGeneration";
import { useState } from "react";
import { InsufficientCreditsDialog } from "./InsufficientCreditsDialog";
import { getModelInfo } from "./utils/modelUtils";

interface ExtendedGenerateImageProps extends GenerateImageProps {
  dailyGenerations: number;
  onGenerate: () => void;
}

export function GenerateImage({ modelId, dailyGenerations, onGenerate }: ExtendedGenerateImageProps) {
  const { toast } = useToast();
  const { loading, handleGenerate, isDisabled, getRequiredCredits } = useGeneration(modelId, dailyGenerations, onGenerate);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);
  const modelInfo = getModelInfo(modelId);

  const onSubmit = async (settings: any) => {
    if (isDisabled()) {
      setShowCreditsDialog(true);
      return;
    }

    const result = await handleGenerate(settings);
    toast({
      title: result.message,
      description: result.description,
      variant: result.success ? "default" : "destructive",
    });
  };

  if (!modelInfo) return null;

  return (
    <div className="space-y-4">
      <GenerationForm
        onSubmit={onSubmit}
        loading={loading}
        disabled={false}
        modelType={modelInfo.type}
        modelCost={getRequiredCredits()}
      />

      <InsufficientCreditsDialog
        open={showCreditsDialog}
        onOpenChange={setShowCreditsDialog}
        modelName={modelInfo.label}
        requiredCredits={getRequiredCredits()}
      />
    </div>
  );
}