import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader, Upload } from "lucide-react";
import { ImageSize, ModelType, FluxSettings, SchnellSettings, ReduxSettings } from "@/types/generation";
import { MediaUpload } from "../feed/post/create/MediaUpload";

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
    const baseSettings = {
      prompt,
      image_size: imageSize,
      num_images: 1,
      num_inference_steps: numInferenceSteps,
    };

    if (modelType === "image-to-image") {
      if (!file) return;
      
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result as string;
        await onSubmit({
          ...baseSettings,
          image_url: base64,
          enable_safety_checker: enableSafetyChecker,
        } as ReduxSettings);
      };
      return;
    }

    if (modelType === "text-to-video" || modelType === "image-to-video" || modelType === "flux") {
      await onSubmit({
        ...baseSettings,
        enable_safety_checker: enableSafetyChecker,
      } as SchnellSettings);
    } else {
      await onSubmit({
        ...baseSettings,
        guidance_scale: guidanceScale,
        safety_tolerance: "2",
      } as FluxSettings);
    }
  };

  return (
    <div className="space-y-4">
      {modelType === "image-to-image" ? (
        <div className="space-y-2">
          <Label>Source Image</Label>
          <MediaUpload file={file} onFileSelect={setFile} />
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
          />
        </div>
      )}

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
        disabled={disabled || loading || (!file && modelType === "image-to-image") || (!prompt.trim() && modelType !== "image-to-image")}
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