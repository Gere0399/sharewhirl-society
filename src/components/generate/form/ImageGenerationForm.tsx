import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ModelType } from "@/types/generation";
import { ImageUpload } from "./ImageUpload";
import { SafetyOptions } from "./SafetyOptions";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ImageGenerationFormProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  modelType: ModelType;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function ImageGenerationForm({
  onSubmit,
  loading,
  disabled,
  modelCost,
  modelType,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [inferenceSteps, setInferenceSteps] = useState(4);
  const [imageSize, setImageSize] = useState<string>("landscape_4_3");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);

  const handleSubmit = async () => {
    if (!prompt) return;
    
    const settings = {
      prompt,
      num_inference_steps: inferenceSteps,
      enable_safety_checker: enableSafetyChecker,
      image_size: imageSize,
      num_images: 1
    };

    if (modelType === "image-to-image" && file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        await onSubmit({
          ...settings,
          image_url: base64Data
        });
      };
      reader.readAsDataURL(file);
    } else {
      await onSubmit(settings);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Image Description</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate"
        />
      </div>

      {modelType === "image-to-image" && (
        <ImageUpload 
          file={file} 
          setFile={setFile}
          required={true}
        />
      )}

      <div className="space-y-2">
        <Label>Resolution</Label>
        <Select value={imageSize} onValueChange={setImageSize}>
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
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
        <Label>Inference Steps ({inferenceSteps})</Label>
        <Slider
          value={[inferenceSteps]}
          onValueChange={(value) => setInferenceSteps(value[0])}
          min={1}
          max={12}
          step={1}
        />
        <div className="text-sm text-muted-foreground">
          Higher values produce better quality but take longer (max: 12)
        </div>
      </div>

      <SafetyOptions
        enableSafetyChecker={enableSafetyChecker}
        setEnableSafetyChecker={setEnableSafetyChecker}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !prompt || (modelType === "image-to-image" && !file)}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Generate</span>
            {hasFreeDaily && dailyGenerations < freeDailyLimit ? (
              <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                <Badge className="h-3 w-3" />
                <span>{freeDailyLimit - dailyGenerations} free left</span>
              </span>
            ) : (
              <span className="ml-2 text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {modelCost}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}