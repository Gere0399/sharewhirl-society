import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenerateImageProps, GenerationSettings } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MODEL_COSTS = {
  "fal-ai/flux": 1,
  "stabilityai/stable-diffusion-xl-base-1.0": 2
};

export function GenerateImage({ modelId }: GenerateImageProps) {
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCredits();
  }, []);

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

  const handleGenerate = async (settings: GenerationSettings) => {
    try {
      const modelCost = MODEL_COSTS[modelId as keyof typeof MODEL_COSTS] || 1;
      
      if (credits === null) {
        throw new Error("Unable to verify credits");
      }

      if (credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      const result = await fal.subscribe(modelId, {
        input: settings,
        logs: true,
      });

      if (result.data.images?.[0]?.url) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Deduct credits
          const { error: creditError } = await supabase.rpc('deduct_credits', {
            amount: modelCost,
            user_id: user.id
          });

          if (creditError) throw creditError;

          // Save generation
          await supabase.from("generations").insert({
            user_id: user.id,
            model_name: modelId,
            model_type: "image",
            prompt: settings.prompt,
            settings: {
              num_inference_steps: settings.num_inference_steps,
              guidance_scale: settings.guidance_scale,
              image_size: settings.image_size,
              safety_tolerance: settings.safety_tolerance,
            },
            output_url: result.data.images[0].url,
            cost: modelCost
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Generate Image</h2>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Subscriptions
        </Button>
      </div>

      <GenerationForm
        onSubmit={handleGenerate}
        loading={loading}
        disabled={credits === null || credits < (MODEL_COSTS[modelId as keyof typeof MODEL_COSTS] || 1)}
      />
    </div>
  );
}