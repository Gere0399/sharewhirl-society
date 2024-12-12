import { useToast } from "@/hooks/use-toast";
import { GenerateImageProps } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGeneration } from "./useGeneration";

interface ExtendedGenerateImageProps extends GenerateImageProps {
  dailyGenerations: number;
  onGenerate: () => void;
}

export function GenerateImage({ modelId, dailyGenerations, onGenerate }: ExtendedGenerateImageProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loading, handleGenerate, isDisabled } = useGeneration(modelId, dailyGenerations, onGenerate);

  const onSubmit = async (settings: any) => {
    const result = await handleGenerate(settings);
    toast({
      title: result.message,
      description: result.description,
      variant: result.success ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Generate Content</h2>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Subscriptions
        </Button>
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
        disabled={isDisabled()}
        modelType={modelId.includes("text-to-video") ? "text-to-video" : 
                  modelId.includes("image-to-video") ? "image-to-video" :
                  modelId.includes("flux") ? "flux" : "sdxl"}
      />
    </div>
  );
}