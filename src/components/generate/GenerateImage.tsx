import { useToast } from "@/hooks/use-toast";
import { GenerateImageProps } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGeneration } from "./useGeneration";
import { useState } from "react";
import { InsufficientCreditsDialog } from "./InsufficientCreditsDialog";
import { getModelInfo } from "./utils/modelUtils";

interface ExtendedGenerateImageProps {
  modelId: GenerateImageProps['modelId'];
  dailyGenerations: number;
  onGenerate: () => void;
}

export function GenerateImage({ modelId, dailyGenerations, onGenerate }: ExtendedGenerateImageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">{modelInfo.label}</h2>
        </div>
      </div>

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