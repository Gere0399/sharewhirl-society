import { useState, useEffect } from "react";
import { fal } from "@fal-ai/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GenerateImageProps, FluxSettings, SchnellSettings, ModelType, ModelId, GenerationSettings } from "@/types/generation";
import { GenerationForm } from "./GenerationForm";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAL_KEY = import.meta.env.VITE_FAL_KEY;
if (!FAL_KEY) {
  console.error('FAL_KEY is not set in environment variables');
}

const MODEL_COSTS: Record<ModelId, number> = {
  "fal-ai/flux": 1,
  "stabilityai/stable-diffusion-xl-base-1.0": 2,
  "fal-ai/text-to-video-schnell": 1,
  "fal-ai/image-to-video-schnell": 1
};

interface ExtendedGenerateImageProps extends GenerateImageProps {
  dailyGenerations: number;
  onGenerate: () => void;
}

export function GenerateImage({ modelId, dailyGenerations, onGenerate }: ExtendedGenerateImageProps) {
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
      const { data, error } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }
      
      setCredits(data?.amount ?? 0);
    }
  };

  const getModelType = (modelId: ModelId): ModelType => {
    if (modelId === "fal-ai/text-to-video-schnell") return "text-to-video";
    if (modelId === "fal-ai/image-to-video-schnell") return "image-to-video";
    if (modelId.includes("flux")) return "flux";
    return "sdxl";
  };

  const handleGenerate = async (settings: FluxSettings | SchnellSettings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate images");
      }

      const modelCost = MODEL_COSTS[modelId] || 1;
      
      const isSchnellModel = modelId.includes("schnell");
      if (isSchnellModel) {
        if (dailyGenerations >= 10) {
          if (credits === null || credits < 1) {
            throw new Error("You've used all free generations. Please purchase credits to continue.");
          }
        }
      } else if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);

      if (!FAL_KEY) {
        throw new Error("FAL_KEY is not configured. Please check your environment variables.");
      }

      const result = await fal.subscribe(modelId, {
        input: {
          ...settings,
          scheduler: "K_EULER",
          seed: Math.floor(Math.random() * 1000000),
        },
        pollInterval: 1000,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      if (result.data.images?.[0]?.url || result.data.video?.url) {
        // Deduct credits if not using free generations
        if (!isSchnellModel || dailyGenerations >= 10) {
          const { error: creditError } = await supabase.rpc('deduct_credits', {
            amount: modelCost,
            user_id: user.id
          });

          if (creditError) throw creditError;
        }

        // Convert settings to a JSON-compatible object
        const generationSettings: GenerationSettings = {
          prompt: settings.prompt,
          image_size: settings.image_size,
          num_images: settings.num_images,
          num_inference_steps: settings.num_inference_steps,
          ...(('guidance_scale' in settings) ? { guidance_scale: settings.guidance_scale } : {}),
          ...(('safety_tolerance' in settings) ? { safety_tolerance: settings.safety_tolerance } : {}),
          ...(('enable_safety_checker' in settings) ? { enable_safety_checker: settings.enable_safety_checker } : {}),
          ...(('seed' in settings) ? { seed: settings.seed } : {})
        };

        // Save generation
        const { error: generationError } = await supabase.from("generations").insert({
          user_id: user.id,
          model_name: modelId,
          model_type: getModelType(modelId),
          prompt: settings.prompt,
          settings: generationSettings,
          output_url: result.data.images?.[0]?.url || result.data.video?.url,
          cost: isSchnellModel && dailyGenerations < 10 ? 0 : modelCost
        });

        if (generationError) throw generationError;

        onGenerate();
        
        if (!isSchnellModel || dailyGenerations >= 10) {
          setCredits(prev => prev !== null ? prev - modelCost : null);
        }

        toast({
          title: "Generation successful",
          description: "Your content has been generated and saved to your history.",
        });
      }
    } catch (error: any) {
      console.error("Generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate content. Please check your configuration.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    const isSchnellModel = modelId.includes("schnell");
    if (isSchnellModel) {
      return dailyGenerations >= 10 && (credits === null || credits < 1);
    }
    return credits === null || credits < (MODEL_COSTS[modelId] || 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/subscriptions")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Generate Content</h2>
        </div>
        <Button variant="outline" onClick={() => navigate("/subscriptions")}>
          Subscriptions
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        {modelId.includes("schnell")
          ? dailyGenerations < 10 
            ? `Free (${10 - dailyGenerations} remaining today)`
            : "1 credit per generation"
          : `${MODEL_COSTS[modelId]} credits per generation`}
      </div>

      <GenerationForm
        onSubmit={handleGenerate}
        loading={loading}
        disabled={isDisabled()}
        modelType={getModelType(modelId)}
      />
    </div>
  );
}