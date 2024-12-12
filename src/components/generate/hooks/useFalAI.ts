import { fal } from "@fal-ai/client";
import { supabase } from "@/integrations/supabase/client";
import { ModelId } from "@/types/generation";

export const useFalAI = () => {
  const getFalKey = async (): Promise<string> => {
    const { data: secretData, error: secretError } = await supabase.rpc('get_secret', {
      secret_name: 'FAL_KEY'
    });

    if (secretError) throw new Error("Unable to access FAL AI services");
    if (!secretData) throw new Error("FAL AI key not found");
    
    return secretData;
  };

  const generateWithFalAI = async (modelId: ModelId, settings: any) => {
    const falKey = await getFalKey();
    console.log("FAL key retrieved successfully");
    
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
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log("FAL AI response:", result);
    return result;
  };

  return { generateWithFalAI };
};