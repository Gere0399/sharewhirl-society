import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { Loader } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenerateImageProps {
  modelId: string;
}

export function GenerateImage({ modelId }: GenerateImageProps) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [numInferenceSteps, setNumInferenceSteps] = useState(28);
  const [guidanceScale, setGuidanceScale] = useState(3.5);
  const [imageSize, setImageSize] = useState("landscape_16_9");
  const [safetyTolerance, setSafetyTolerance] = useState("2");
  const [credits, setCredits] = useState<number | null>(null);
  const [modelCost, setModelCost] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
    fetchModelCost();
  }, [modelId]);

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();
      setCredits(data?.amount ?? 0);
    }
  };

  const fetchModelCost = async () => {
    const { data } = await supabase
      .from('model_costs')
      .select('credits_cost')
      .eq('model_id', modelId)
      .single();
    setModelCost(data?.credits_cost ?? null);
  };

  const handleGenerate = async () => {
    try {
      if (credits === null || modelCost === null) {
        throw new Error("Unable to verify credits");
      }

      if (credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      const result = await fal.subscribe(modelId, {
        input: {
          prompt,
          num_inference_steps: numInferenceSteps,
          guidance_scale: guidanceScale,
          image_size: imageSize,
          safety_tolerance: safetyTolerance,
          num_images: 1,
        },
      });

      if (result.data.images?.[0]?.url) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Deduct credits
          await supabase.rpc('deduct_credits', {
            amount: modelCost,
            user_id: user.id
          });

          // Save generation
          await supabase.from("generations").insert({
            user_id: user.id,
            model_name: modelId,
            model_type: "image",
            prompt,
            settings: {
              num_inference_steps: numInferenceSteps,
              guidance_scale: guidanceScale,
              image_size: imageSize,
              safety_tolerance: safetyTolerance,
            },
            output_url: result.data.images[0].url,
          });

          // Update local credits state
          setCredits(prev => prev !== null ? prev - modelCost : null);
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
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Generate Image</h2>
        <div className="text-sm">
          Credits: <span className="font-semibold">{credits ?? '...'}</span>
          {modelCost && <span className="text-muted-foreground ml-2">Cost: {modelCost} credits</span>}
        </div>
      </div>

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
        <Select value={imageSize} onValueChange={setImageSize}>
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
        <Select value={safetyTolerance} onValueChange={setSafetyTolerance}>
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
        onClick={handleGenerate} 
        disabled={loading || !prompt.trim() || credits === null || credits < (modelCost ?? Infinity)}
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