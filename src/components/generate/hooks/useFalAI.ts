import { supabase } from "@/integrations/supabase/client";

export const useFalAI = () => {
  const generateWithFalAI = async (modelId: string, settings: any) => {
    try {
      console.log("Submitting request to FAL AI model:", modelId);
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { modelId, settings }
      });

      if (error) throw error;
      if (!data) throw new Error("No response received from generation function");

      console.log("FAL AI response received:", data);
      return data;
    } catch (error: any) {
      console.error("FAL AI generation error:", error);
      throw new Error(error.message || "Failed to generate content. Please try again later.");
    }
  };

  return { generateWithFalAI };
};