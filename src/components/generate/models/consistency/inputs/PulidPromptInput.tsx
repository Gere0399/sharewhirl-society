import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PulidPromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
}

export function PulidPromptInput({ 
  prompt, 
  setPrompt, 
  negativePrompt, 
  setNegativePrompt 
}: PulidPromptInputProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Image Description</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="negativePrompt">Negative Prompt</Label>
        <Textarea
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Describe what you don't want in the image"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}