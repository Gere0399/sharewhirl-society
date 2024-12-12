import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"
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

    // Configure FAL client
    fal.config({
      credentials: falKey
    });

    let result;
    
    switch (modelId) {
      case 'fal-ai/flux/schnell':
        console.log('Generating text-to-image with settings:', settings);
        result = await fal.subscribe(modelId, {
          input: {
            prompt: settings.prompt || "",
            image_size: settings.image_size || "landscape_16_9",
            num_images: settings.num_images || 1,
            num_inference_steps: settings.num_inference_steps || 4,
            enable_safety_checker: settings.enable_safety_checker
          },
          logs: true
        });
        break;

      case 'fal-ai/flux/schnell/redux':
        console.log('Generating image-to-image with settings:', settings);
        result = await fal.subscribe(modelId, {
          input: {
            prompt: settings.prompt || "enhance this image",
            image_url: settings.image_url,
            image_size: settings.image_size || "landscape_16_9",
            num_images: settings.num_images || 1,
            num_inference_steps: settings.num_inference_steps || 4,
            enable_safety_checker: settings.enable_safety_checker
          },
          logs: true
        });
        break;

      case 'fal-ai/stable-audio':
        console.log('Generating audio with settings:', settings);
        result = await fal.subscribe(modelId, {
          input: {
            prompt: settings.prompt || "background music",
            seconds_total: settings.seconds_total || 30,
            steps: settings.steps || 10
          },
          logs: true
        });
        break;

      case 'fal-ai/speech-to-speech':
        console.log('Generating speech with settings:', settings);
        if (!settings.gen_text) {
          throw new Error("gen_text is required for speech generation");
        }
        if (!settings.audio_url) {
          throw new Error("audio_url is required for speech generation");
        }
        
        result = await fal.subscribe(modelId, {
          input: {
            gen_text: settings.gen_text,
            ref_text: settings.ref_text,
            audio_url: settings.audio_url,
            model_type: settings.model_type || "F5-TTS",
            remove_silence: settings.remove_silence ?? true
          },
          logs: true
        });
        break;

      default:
        throw new Error(`Unsupported model: ${modelId}`)
    }

    console.log('FAL AI response:', result);

    return new Response(JSON.stringify(result), {
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