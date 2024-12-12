import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader } from "lucide-react";
import { ImageSize, ModelType, FluxSettings, FluxSchnellSettings } from "@/types/generation";

interface GenerationFormProps {
  onSubmit: (settings: FluxSettings | FluxSchnellSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
}

export function GenerationForm({ onSubmit, loading, disabled, modelType }: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(modelType === "flux-schnell" ? 4 : 28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_16_9");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);

  const handleSubmit = async () => {
    const baseSettings = {
      prompt,
      image_size: imageSize,
      num_images: 1,
    };

    if (modelType === "flux-schnell") {
      await onSubmit({
        ...baseSettings,
        num_inference_steps: numInferenceSteps,
        enable_safety_checker: enableSafetyChecker,
      });
    } else {
      await onSubmit({
        ...baseSettings,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt..."
        />
      </div>

      <div className="space-y-2">
        <Label>Image Size</Label>
        <Select value={imageSize} onValueChange={(value) => setImageSize(value as ImageSize)}>
          <SelectTrigger>
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square_hd">Square HD</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
            <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
            <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
            <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Inference Steps ({numInferenceSteps})</Label>
        <Slider
          value={[numInferenceSteps]}
          onValueChange={([value]) => setNumInferenceSteps(value)}
          min={modelType === "flux-schnell" ? 1 : 1}
          max={modelType === "flux-schnell" ? 10 : 50}
          step={1}
        />
      </div>

      {modelType !== "flux-schnell" && (
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

      {modelType === "flux-schnell" && (
        <div className="flex items-center space-x-2">
          <Switch
            id="safety-checker"
            checked={enableSafetyChecker}
            onCheckedChange={setEnableSafetyChecker}
          />
          <Label htmlFor="safety-checker">Enable Safety Checker</Label>
        </div>
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !prompt.trim()}
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