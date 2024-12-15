import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { useCredits } from "../../hooks/useCredits";

export function usePulidGeneration(modelId: string, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();

  const getRequiredCredits = () => {
    return 50; // Cost for Pulid model
  };

  const handleGenerate = async (settings: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to generate content");
      }

      const modelCost = getRequiredCredits();
      if (credits === null || credits < modelCost) {
        throw new Error("Insufficient credits");
      }

      setLoading(true);
      console.log("Starting Pulid generation with settings:", settings);

      const result = await supabase.functions.invoke('generate-pulid-image', {
        body: { modelId, settings }
      });

      if (!result.data) {
        throw new Error("No response received from generation function");
      }

      const outputUrl = result.data.images?.[0]?.url;
      if (!outputUrl) {
        throw new Error("No output URL in response");
      }

      const { error: creditError } = await supabase
        .from('credits')
        .update({ amount: credits! - modelCost })
        .eq('user_id', user.id);

      if (creditError) throw creditError;

      const { error: generationError } = await supabase.from('generations').insert({
        user_id: user.id,
        model_name: modelId,
        model_type: "consistency",
        prompt: settings.prompt,
        settings: settings,
        output_url: outputUrl,
        cost: modelCost
      });

      if (generationError) throw generationError;

      onGenerate();
      setCredits(prev => prev !== null ? prev - modelCost : null);

      return {
        success: true,
        message: "Generation successful",
        description: "Your content has been generated and saved to your history.",
      };
    } catch (error: any) {
      console.error("Generation error:", error);
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate content. Please check your configuration.",
      };
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = () => {
    return credits === null || credits < getRequiredCredits();
  };

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
    getRequiredCredits,
  };
}