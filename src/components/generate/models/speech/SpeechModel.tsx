import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader, DollarSign, Badge } from "lucide-react";
import { AudioUpload } from "../../form/AudioUpload";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";

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
  const [refText, setRefText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [removeSilence, setRemoveSilence] = useState(true);

  const handleSubmit = async () => {
    if (!text || !file) return;
    
    try {
      // Generate a unique filename
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `speech-ref-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(`speech/${uniqueFileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(`speech/${uniqueFileName}`);

      await onSubmit({
        gen_text: text,
        ref_audio_url: publicUrl,
        ref_text: refText || undefined,
        model_type: "F5-TTS",
        remove_silence: removeSilence
      });
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text">Text to Convert</Label>
        <Textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the text you want to convert to speech"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="refText">Reference Text (Optional)</Label>
        <Input
          id="refText"
          value={refText}
          onChange={(e) => setRefText(e.target.value)}
          placeholder="Enter the reference text"
        />
      </div>

      <div className="space-y-2">
        <Label>Reference Audio</Label>
        <AudioUpload file={file} setFile={setFile} required />
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
        disabled={disabled || loading || !text || !file}
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
