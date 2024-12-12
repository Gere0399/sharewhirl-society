import { fal } from "@fal-ai/client";
import { supabase } from "@/integrations/supabase/client";

export const useFalAI = () => {
  const getFalKey = async (): Promise<string> => {
    const { data: secretData, error: secretError } = await supabase.rpc('get_secret', {
      secret_name: 'FAL_KEY'
    });

    if (secretError) {
      console.error("Error accessing FAL AI services:", secretError);
      throw new Error("Unable to access FAL AI services. Please check your configuration.");
    }
    
    if (!secretData) {
      console.error("FAL key not found in secrets");
      throw new Error("FAL AI key not configured. Please add your FAL API key in the settings.");
    }

    // Log key format (safely)
    console.log("FAL key format check:", {
      isString: typeof secretData === 'string',
      length: secretData?.length,
      startsWithFal: secretData?.startsWith('fal_'),
      isEmpty: !secretData?.trim()
    });
    
    if (typeof secretData !== 'string' || !secretData.trim()) {
      console.error("Invalid FAL key format");
      throw new Error("Invalid FAL AI key format. Please check your API key configuration.");
    }

    // Verify key format
    if (!secretData.startsWith('fal_')) {
      console.error("FAL key does not start with 'fal_'");
      throw new Error("Invalid FAL AI key format. The key should start with 'fal_'.");
    }
    
    return secretData;
  };

  const generateWithFalAI = async (modelId: string, settings: any) => {
    try {
      const falKey = await getFalKey();
      console.log("FAL key validation passed");
      
      fal.config({
        credentials: falKey
      });

      console.log("Submitting request to FAL AI model:", modelId);
      const result = await fal.subscribe(modelId, {
        input: {
          prompt: settings.prompt,
          image_size: settings.image_size,
          num_images: settings.num_images,
          num_inference_steps: settings.num_inference_steps,
          enable_safety_checker: 'enable_safety_checker' in settings ? settings.enable_safety_checker : true,
        },
        pollInterval: 1000,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generation progress:", update.logs.map(log => log.message));
          }
        },
      });

      if (!result) {
        throw new Error("No response received from FAL AI");
      }

      console.log("FAL AI response received:", result);
      return result;
    } catch (error: any) {
      console.error("FAL AI generation error:", error);
      
      // Handle specific error types
      if (error.status === 401) {
        throw new Error("Invalid FAL AI key. Please check your API key configuration.");
      } else if (error.message?.includes("not found")) {
        throw new Error("FAL AI key not found. Please configure your API key in the settings.");
      }
      
      // Re-throw the error with a more user-friendly message
      throw new Error(error.message || "Failed to generate content. Please try again later.");
    }
  };

  return { generateWithFalAI };
};