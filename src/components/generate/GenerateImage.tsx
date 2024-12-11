import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenerateImageProps, GenerationSettings } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { CreditDisplay } from "./CreditDisplay";

export function GenerateImage({ modelId }: GenerateImageProps) {
  const [loading, setLoading] = useState(false);
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

  const handleGenerate = async (settings: GenerationSettings) => {
    try {
      if (credits === null || modelCost === null) {
        throw new Error("Unable to verify credits");
      }

      if (credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      const result = await fal.subscribe(modelId, {
        input: settings,
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
            prompt: settings.prompt,
            settings: {
              num_inference_steps: settings.num_inference_steps,
              guidance_scale: settings.guidance_scale,
              image_size: settings.image_size,
              safety_tolerance: settings.safety_tolerance,
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
        <CreditDisplay credits={credits} modelCost={modelCost} />
      </div>

      <GenerationForm
        onSubmit={handleGenerate}
        loading={loading}
        disabled={credits === null || credits < (modelCost ?? Infinity)}
      />
    </div>
  );
}