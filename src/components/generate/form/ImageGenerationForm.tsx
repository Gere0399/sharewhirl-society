import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ModelType } from "@/types/generation";

interface ImageGenerationFormProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelType: ModelType;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function ImageGenerationForm({
  onSubmit,
  loading,
  disabled,
  modelType,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: ImageGenerationFormProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async () => {
    if (!prompt) return;
    
    await onSubmit({
      prompt,
      num_inference_steps: 30,
      enable_safety_checker: true
    });
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