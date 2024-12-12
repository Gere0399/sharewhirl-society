import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL API key not configured')
    }

    const { modelId, settings } = await req.json()

    if (!modelId || !settings) {
      throw new Error('Missing required parameters')
    }

    console.log("Starting generation with settings:", settings)

    try {
      // Configure FAL client
      fal.config({
        credentials: falKey
      })

      // Generate image with FAL AI
      console.log("Submitting to FAL AI with modelId:", modelId)
      
      // Prepare input based on model type
      const input = modelId === "fal-ai/flux/schnell/redux" ? {
        image_url: settings.image_url,
        prompt: settings.prompt || "enhance this image",
        image_size: settings.image_size,
        num_inference_steps: settings.num_inference_steps,
        num_images: settings.num_images || 1,
        enable_safety_checker: settings.enable_safety_checker,
      } : settings;

      console.log("Submitting with input:", input);

      const result = await fal.subscribe(modelId, {
        input,
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log("FAL AI response received:", result);

      if (!result?.data?.images?.[0]?.url) {
        throw new Error("No output URL in response from FAL AI");
      }

      return new Response(
        JSON.stringify({ data: result.data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (error: any) {
      console.error('FAL AI request error:', error)
      throw error
    }
  } catch (error: any) {
    console.error('Error in generate-image function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})