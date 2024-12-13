import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader, DollarSign, Badge } from "lucide-react";

interface AudioGenerationFormProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function AudioGenerationForm({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: AudioGenerationFormProps) {
  const [prompt, setPrompt] = useState("");
  const [numInferenceSteps, setNumInferenceSteps] = useState(4);
  const [secondsTotal, setSecondsTotal] = useState(30);

  const handleSubmit = async () => {
    if (!prompt) return;
    
    await onSubmit({
      prompt,
      seconds_total: secondsTotal,
      steps: numInferenceSteps,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Audio Description</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the audio you want to generate (e.g., '128 BPM tech house drum loop')"
        />
      </div>

      <div className="space-y-2">
        <Label>Steps ({numInferenceSteps})</Label>
        <Slider
          value={[numInferenceSteps]}
          onValueChange={([value]) => setNumInferenceSteps(value)}
          min={1}
          max={100}
          step={1}
        />
      </div>

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