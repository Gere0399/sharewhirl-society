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
      console.error('FAL API key not configured')
      throw new Error('FAL API key not configured')
    }

    const { modelId, settings } = await req.json()

    if (!modelId || !settings) {
      console.error('Missing required parameters:', { modelId, settings })
      throw new Error('Missing required parameters')
    }

    console.log('Starting generation with settings:', settings)

    try {
      // Configure FAL client
      fal.config({
        credentials: falKey
      })

      // Subscribe to the model and get results
      const result = await fal.subscribe(modelId, {
        input: {
          prompt: settings.prompt,
          image_size: settings.image_size,
          num_inference_steps: settings.num_inference_steps,
          num_images: settings.num_images || 1,
          enable_safety_checker: settings.enable_safety_checker
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });

      console.log('Generation completed:', result)

      return new Response(
        JSON.stringify({ data: result }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )

    } catch (error) {
      console.error('FAL AI request error:', error)
      throw error
    }
  } catch (error) {
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