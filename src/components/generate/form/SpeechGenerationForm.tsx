import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, DollarSign, Badge } from "lucide-react";
import { AudioUpload } from "./AudioUpload";

interface SpeechGenerationFormProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function SpeechGenerationForm({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: SpeechGenerationFormProps) {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");

  const handleSubmit = async () => {
    if (!text || !audioUrl) return;
    
    await onSubmit({
      gen_text: text,
      audio_url: audioUrl,
      model_type: "F5-TTS"
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text to Convert</Label>
        <Input
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech"
        />
      </div>

      <div className="space-y-2">
        <Label>Reference Audio</Label>
        <AudioUpload onUpload={setAudioUrl} />
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !text || !audioUrl}
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