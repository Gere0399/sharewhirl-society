import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ImageSize, ModelType, GenerationSettings } from "@/types/generation";
import { ImageUpload } from "./form/ImageUpload";
import { SafetyOptions } from "./form/SafetyOptions";
import { AspectRatioSelect } from "./form/AspectRatioSelect";
import { AudioUpload } from "./form/AudioUpload";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GenerationFormProps {
  onSubmit: (settings: GenerationSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function GenerationForm({ 
  onSubmit, 
  loading, 
  disabled, 
  modelType, 
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(4);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_16_9");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [secondsTotal, setSecondsTotal] = useState(30);
  
  // Speech-specific states
  const [genText, setGenText] = useState("");
  const [refText, setRefText] = useState("");
  const [speechModelType, setSpeechModelType] = useState<"F5-TTS" | "E2-TTS">("F5-TTS");
  const [removeSilence, setRemoveSilence] = useState(true);

  const handleSubmit = async () => {
    if (modelType === "image-to-image" && !file) {
      return;
    }

    if (modelType === "speech" && !file) {
      return;
    }

    if (modelType === "audio") {
      if (!prompt) {
        return;
      }
      await onSubmit({
        prompt,
        seconds_total: secondsTotal,
        steps: numInferenceSteps,
      });
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

      {modelType === "speech" && (
        <>
          <AudioUpload file={file} setFile={setFile} required />
          
          <div className="space-y-2">
            <Label htmlFor="genText">Generated Text</Label>
            <Input
              id="genText"
              value={genText}
              onChange={(e) => setGenText(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refText">Reference Text (Optional)</Label>
            <Input
              id="refText"
              value={refText}
              onChange={(e) => setRefText(e.target.value)}
              placeholder="Enter reference text for the audio..."
            />
          </div>

          <div className="space-y-2">
            <Label>Model Type</Label>
            <Select value={speechModelType} onValueChange={(value: "F5-TTS" | "E2-TTS") => setSpeechModelType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="F5-TTS">F5-TTS</SelectItem>
                <SelectItem value="E2-TTS">E2-TTS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="removeSilence"
              checked={removeSilence}
              onCheckedChange={setRemoveSilence}
            />
            <Label htmlFor="removeSilence">Remove Silence</Label>
          </div>
        </>
      )}

      {modelType !== "speech" && modelType !== "audio" && (
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt {modelType === "image-to-image" && "(Optional)"}</Label>
          <Input
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={modelType === "image-to-image" ? "Enhance this image (optional)" : "Enter your prompt..."}
          />
        </div>
      )}

      {modelType !== "audio" && modelType !== "speech" && (
        <AspectRatioSelect imageSize={imageSize} setImageSize={setImageSize} />
      )}

      {modelType !== "speech" && (
        <div className="space-y-2">
          <Label>
            {modelType === "audio" ? "Steps" : "Inference Steps"} ({numInferenceSteps})
          </Label>
          <Slider
            value={[numInferenceSteps]}
            onValueChange={([value]) => setNumInferenceSteps(value)}
            min={1}
            max={modelType === "audio" ? 100 : 50}
            step={1}
          />
        </div>
      )}

      {modelType === "audio" && (
        <div className="space-y-2">
          <Label>Duration (seconds)</Label>
          <Slider
            value={[secondsTotal]}
            onValueChange={([value]) => setSecondsTotal(value)}
            min={1}
            max={300}
            step={1}
          />
          <span className="text-sm text-muted-foreground">{secondsTotal} seconds</span>
        </div>
      )}

      {modelType !== "audio" && modelType !== "speech" && (
        <SafetyOptions 
          enableSafetyChecker={enableSafetyChecker}
          setEnableSafetyChecker={setEnableSafetyChecker}
        />
      )}

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || (modelType === "image-to-image" && !file) || (modelType === "speech" && (!file || !genText))}
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
