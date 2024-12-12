import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader, DollarSign } from "lucide-react";
import { ImageSize, ModelType, GenerationSettings } from "@/types/generation";
import { ImageUpload } from "./form/ImageUpload";
import { SafetyOptions } from "./form/SafetyOptions";
import { AspectRatioSelect } from "./form/AspectRatioSelect";

interface GenerationFormProps {
  onSubmit: (settings: GenerationSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
  modelCost: number;
}

export function GenerationForm({ onSubmit, loading, disabled, modelType, modelCost }: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(4);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_16_9");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (modelType === "image-to-image" && !file) {
      return;
    }

    const baseSettings = {
      prompt: prompt || (modelType === "image-to-image" ? "enhance this image" : ""),
      image_size: imageSize,
      num_images: 1,
      num_inference_steps: numInferenceSteps,
      enable_safety_checker: enableSafetyChecker,
    };

    if (modelType === "image-to-image") {
      if (!file) return;
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        await onSubmit({
          ...baseSettings,
          image_url: base64,
        });
      };
      return;
    }

    await onSubmit(baseSettings);
  };

  return (
    <div className="space-y-4">
      {modelType === "image-to-image" && (
        <ImageUpload file={file} setFile={setFile} required />
      )}

      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt {modelType === "image-to-image" && "(Optional)"}</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={modelType === "image-to-image" ? "Enhance this image (optional)" : "Enter your prompt..."}
        />
      </div>

      <AspectRatioSelect imageSize={imageSize} setImageSize={setImageSize} />

      <div className="space-y-2">
        <Label>Inference Steps ({numInferenceSteps})</Label>
        <Slider
          value={[numInferenceSteps]}
          onValueChange={([value]) => setNumInferenceSteps(value)}
          min={1}
          max={50}
          step={1}
        />
      </div>

      <SafetyOptions 
        enableSafetyChecker={enableSafetyChecker}
        setEnableSafetyChecker={setEnableSafetyChecker}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || (modelType === "image-to-image" && !file)}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            Generate
            {modelCost > 0 && (
              <span className="ml-2 text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {modelCost}
              </span>
            )}
          </>
        )}
      </Button>
    </div>
  );
}