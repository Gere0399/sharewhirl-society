import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { SpeechSettings } from "@/types/generation";

interface SpeechGenerationResult {
  success: boolean;
  message: string;
  description: string;
}

export function useSpeechGeneration(modelId: string, onGenerate: () => void) {
  const [loading, setLoading] = useState(false);
  const { credits, setCredits } = useCredits();
  
  const getRequiredCredits = () => 150;

  const isDisabled = () => {
    return credits === null || credits < getRequiredCredits();
  };

  const handleGenerate = async (settings: SpeechSettings): Promise<SpeechGenerationResult> => {
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
      console.log("Starting Speech generation with settings:", settings);

      // Generate a unique filename for the uploaded audio
      const timestamp = new Date().getTime();
      const fileName = `speech-${timestamp}-${Math.random().toString(36).substring(7)}.mp3`;

      // Call the edge function to generate speech
      const result = await supabase.functions.invoke('generate-speech', {
        body: {
          ...settings,
          fileName
        }
      });

      console.log("Speech generation response:", result);

      if (!result.data?.audio_url) {
        throw new Error("No audio URL in response");
      }

      const { error: creditError } = await supabase
        .from('credits')
        .update({ amount: credits - modelCost })
        .eq('user_id', user.id);

      if (creditError) throw creditError;

      const { error: generationError } = await supabase.from('generations').insert({
        user_id: user.id,
        model_name: modelId,
        model_type: "speech",
        prompt: settings.gen_text,
        settings: settings as unknown as Database['public']['Tables']['generations']['Insert']['settings'],
        output_url: result.data.audio_url,
        cost: modelCost
      });

      if (generationError) throw generationError;

      onGenerate();
      setCredits(prev => prev !== null ? prev - modelCost : null);

      toast({
        title: "Generation successful",
        description: "Your speech has been generated and saved to your history.",
      });

      return {
        success: true,
        message: "Generation successful",
        description: "Your speech has been generated and saved to your history.",
      };

    } catch (error: any) {
      console.error("Speech generation error:", error);
      
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate speech. Please try again.",
        variant: "destructive"
      });
      
      return {
        success: false,
        message: "Generation failed",
        description: error.message || "Failed to generate speech. Please try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    credits,
    handleGenerate,
    isDisabled,
    getRequiredCredits,
  };
}