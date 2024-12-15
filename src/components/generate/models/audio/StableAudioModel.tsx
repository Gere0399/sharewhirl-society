import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, DollarSign, Badge } from "lucide-react";
import { AudioUpload } from "../form/AudioUpload";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface StableAudioModelProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function StableAudioModel({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: StableAudioModelProps) {
  const [prompt, setPrompt] = useState("");
  const [secondsTotal, setSecondsTotal] = useState(0);
  const [steps, setSteps] = useState(0);
  const [removeSilence, setRemoveSilence] = useState(true);

  const handleSubmit = async () => {
    if (!prompt || secondsTotal <= 0 || steps <= 0) return;

    try {
      await onSubmit({
        prompt,
        seconds_total: secondsTotal,
        steps,
        remove_silence: removeSilence
      });
    } catch (error) {
      console.error("Error submitting settings:", error);
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
          placeholder="Enter the prompt for audio generation"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondsTotal">Total Seconds</Label>
        <Input
          id="secondsTotal"
          type="number"
          value={secondsTotal}
          onChange={(e) => setSecondsTotal(Number(e.target.value))}
          placeholder="Enter total seconds for audio"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="steps">Steps</Label>
        <Input
          id="steps"
          type="number"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
          placeholder="Enter number of steps"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="remove-silence"
          checked={removeSilence}
          onCheckedChange={setRemoveSilence}
        />
        <Label htmlFor="remove-silence">Remove Silence</Label>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !prompt || secondsTotal <= 0 || steps <= 0}
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
