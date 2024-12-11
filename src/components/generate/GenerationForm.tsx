import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader } from "lucide-react";
import { GenerationSettings, ImageSize, SafetyTolerance } from "@/types/generation";

interface GenerationFormProps {
  onSubmit: (settings: GenerationSettings) => Promise<void>;
  loading: boolean;
  disabled: boolean;
}

export function GenerationForm({ onSubmit, loading, disabled }: GenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_16_9");
  const [safetyTolerance, setSafetyTolerance] = useState<SafetyTolerance>("2");

  const handleSubmit = async () => {
    await onSubmit({
      prompt,
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
      image_size: imageSize,
      safety_tolerance: safetyTolerance,
      num_images: 1,
    });
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
          min={1}
          max={50}
          step={1}
        />
      </div>

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

      <div className="space-y-2">
        <Label>Safety Tolerance</Label>
        <Select value={safetyTolerance} onValueChange={(value) => setSafetyTolerance(value as SafetyTolerance)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tolerance" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Very Strict</SelectItem>
            <SelectItem value="2">Strict</SelectItem>
            <SelectItem value="3">Moderate</SelectItem>
            <SelectItem value="4">Permissive</SelectItem>
            <SelectItem value="5">Very Permissive</SelectItem>
          </SelectContent>
        </Select>
      </div>

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