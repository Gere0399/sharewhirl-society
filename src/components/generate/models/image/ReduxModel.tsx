import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, DollarSign, Badge } from "lucide-react";
import { AudioUpload } from "../form/AudioUpload";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

interface ReduxGenerationFormProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function ReduxGenerationForm({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: ReduxGenerationFormProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [removeSilence, setRemoveSilence] = useState(true);

  const handleSubmit = async () => {
    if (!imageUrl) return;

    try {
      await onSubmit({
        image_url: imageUrl,
        model_type: "F5-TTS",
        remove_silence: removeSilence
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Enter the image URL"
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
        disabled={disabled || loading || !imageUrl}
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
