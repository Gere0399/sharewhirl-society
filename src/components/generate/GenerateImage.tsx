import { useToast } from "@/hooks/use-toast";
import { GenerateImageProps } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGeneration } from "./useGeneration";
import { useState } from "react";
import { InsufficientCreditsDialog } from "./InsufficientCreditsDialog";

interface ExtendedGenerateImageProps extends GenerateImageProps {
  dailyGenerations: number;
  onGenerate: () => void;
}

export function GenerateImage({ modelId, dailyGenerations, onGenerate }: ExtendedGenerateImageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loading, handleGenerate, isDisabled, getRequiredCredits } = useGeneration(modelId, dailyGenerations, onGenerate);
  const [showCreditsDialog, setShowCreditsDialog] = useState(false);

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

  const modelType = modelId.includes("text-to-video") ? "text-to-video" : 
                   modelId.includes("image-to-video") ? "image-to-video" :
                   modelId.includes("redux") ? "image-to-image" :
                   modelId.includes("flux") ? "flux" : "sdxl";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Generate Content</h2>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        {modelId.includes("schnell")
          ? dailyGenerations < 10 
            ? `Free (${10 - dailyGenerations} remaining today)`
            : "1 credit per generation"
          : `${modelId.includes("flux") ? "1" : "2"} credits per generation`}
      </div>

      <GenerationForm
        onSubmit={onSubmit}
        loading={loading}
        disabled={false}
        modelType={modelType}
      />

      <InsufficientCreditsDialog
        open={showCreditsDialog}
        onOpenChange={setShowCreditsDialog}
        modelName={modelId.split("/").pop() || "model"}
        requiredCredits={getRequiredCredits()}
      />
    </div>
  );
}