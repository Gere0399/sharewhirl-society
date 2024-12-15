import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, DollarSign, Badge } from "lucide-react";
import { AudioUpload } from "../../form/AudioUpload";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface FluxModelProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function FluxModel({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: FluxModelProps) {
  const [prompt, setPrompt] = useState("");
  const [numImages, setNumImages] = useState(1);
  const [imageSize, setImageSize] = useState("square");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);

  const handleSubmit = async () => {
    if (!prompt) return;

    try {
      await onSubmit({
        prompt,
        num_images: numImages,
        image_size: imageSize,
        enable_safety_checker: enableSafetyChecker
      });
    } catch (error) {
      console.error("Error generating images:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Prompt</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="numImages">Number of Images</Label>
        <Input
          id="numImages"
          type="number"
          value={numImages}
          onChange={(e) => setNumImages(Number(e.target.value))}
          min={1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageSize">Image Size</Label>
        <select
          id="imageSize"
          value={imageSize}
          onChange={(e) => setImageSize(e.target.value)}
          className="w-full"
        >
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="enable-safety-checker"
          checked={enableSafetyChecker}
          onCheckedChange={setEnableSafetyChecker}
        />
        <Label htmlFor="enable-safety-checker">Enable Safety Checker</Label>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !prompt}
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
