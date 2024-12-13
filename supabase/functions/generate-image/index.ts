import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"
import { generateStableAudio } from "../models/stableAudio.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { modelId, settings } = await req.json()
    console.log('Received request for model:', modelId, 'with settings:', settings)

    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY not found in environment variables')
    }

    fal.config({
      credentials: falKey
    });

    let result;
    
    switch (modelId) {
      case 'fal-ai/stable-audio':
        console.log('Generating audio with settings:', settings);
        result = await generateStableAudio(settings);
        break;
      case 'fal-ai/flux/schnell':
        console.log('Generating text-to-image with settings:', settings);
        result = await fal.subscribe('fal-ai/flux/schnell', {
          input: {
            prompt: settings.prompt,
            image_size: settings.image_size || "1024x1024",
            num_inference_steps: settings.num_inference_steps || 30,
            enable_safety_checker: settings.enable_safety_checker,
            num_images: 1
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              update.logs.map((log) => log.message).forEach(console.log);
            }
          }
        });
        break;
      case 'fal-ai/flux/schnell/redux':
        console.log('Generating image-to-image with settings:', settings);
        if (!settings.image_url) {
          throw new Error('Image URL is required for image-to-image generation');
        }
        result = await fal.subscribe('fal-ai/flux/schnell/redux', {
          input: {
            prompt: settings.prompt,
            image_url: settings.image_url,
            num_inference_steps: settings.num_inference_steps || 30,
            enable_safety_checker: settings.enable_safety_checker,
            num_images: 1
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              update.logs.map((log) => log.message).forEach(console.log);
            }
          }
        });
        break;
      default:
        throw new Error(`Unsupported model: ${modelId}`)
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})