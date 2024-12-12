import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader } from "lucide-react";
import { ImageSize, ModelType, FluxSettings, SchnellSettings, ReduxSettings } from "@/types/generation";
import { ImageUpload } from "./form/ImageUpload";
import { SafetyOptions } from "./form/SafetyOptions";
import { AspectRatioSelect } from "./form/AspectRatioSelect";

interface GenerationFormProps {
  onSubmit: (settings: FluxSettings | SchnellSettings | ReduxSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
}

export function GenerationForm({ onSubmit, loading, disabled, modelType }: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(modelType === "text-to-video" || modelType === "image-to-video" ? 4 : 4);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
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
      
      // Convert file to base64 for image-to-image generation
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        await onSubmit({
          ...baseSettings,
          image_url: base64,
        } as ReduxSettings);
      };
      return;
    }

    if (modelType === "text-to-video" || modelType === "image-to-video") {
      await onSubmit({
        ...baseSettings,
      } as SchnellSettings);
    } else {
      await onSubmit({
        ...baseSettings,
        guidance_scale: guidanceScale,
      } as FluxSettings);
    }
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
          min={modelType === "text-to-video" || modelType === "image-to-video" ? 1 : 1}
          max={modelType === "text-to-video" || modelType === "image-to-video" ? 10 : 50}
          step={1}
        />
      </div>

      {modelType !== "text-to-video" && modelType !== "image-to-video" && modelType !== "image-to-image" && (
        <div className="space-y-2">
          <Label>Guidance Scale ({guidanceScale})</Label>
          <Slider
            value={[guidanceScale]}
            onValueChange={([value]) => setGuidanceScale(value)}
            min={1}
            max={20}
            step={0.1}
          />
        </div>
      )}

      {(modelType === "text-to-video" || modelType === "image-to-video" || modelType === "image-to-image") && (
        <SafetyOptions 
          enableSafetyChecker={enableSafetyChecker}
          setEnableSafetyChecker={setEnableSafetyChecker}
        />
      )}

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
          "Generate"
        )}
      </Button>
    </div>
  );
}