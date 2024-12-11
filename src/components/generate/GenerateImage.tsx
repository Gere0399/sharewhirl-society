import { useState } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";

interface GenerateImageProps {
  modelId: string;
}

export function GenerateImage({ modelId }: GenerateImageProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setLoading(true);

      const result = await fal.subscribe(modelId, {
        input: {
          prompt,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          image_size: "landscape_16_9",
          num_images: 1,
          safety_tolerance: "2",
        },
      });

      if (result.data.images?.[0]?.url) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          await supabase.from("generations").insert({
            user_id: user.id,
            model_name: modelId,
            model_type: "image",
            prompt,
            settings: {
              num_inference_steps: numInferenceSteps,
              guidance_scale: guidanceScale,
            },
            output_url: result.data.images[0].url,
          });
        }

        toast({
          title: "Image generated successfully",
          description: "Your image has been generated and saved to your history.",
        });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

      <Button 
        onClick={handleGenerate} 
        disabled={loading || !prompt.trim()}
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