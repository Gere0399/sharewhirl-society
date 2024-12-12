import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
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

    let endpoint = ''
    let input = {}

    if (modelId === 'fal-ai/flux/schnell') {
      endpoint = 'https://110602490-flux-schnell.gateway.alpha.fal.ai/'
      input = {
        prompt: settings.prompt,
        image_size: settings.image_size || "landscape_16_9",
        num_images: settings.num_images || 1,
        num_inference_steps: settings.num_inference_steps || 4,
        enable_safety_checker: settings.enable_safety_checker,
      }
    } else if (modelId === 'fal-ai/flux/schnell/redux') {
      endpoint = 'https://110602490-flux-schnell-redux.gateway.alpha.fal.ai/'
      input = {
        prompt: settings.prompt || "enhance this image",
        image_url: settings.image_url,
        image_size: settings.image_size || "landscape_16_9",
        num_images: settings.num_images || 1,
        num_inference_steps: settings.num_inference_steps || 4,
        enable_safety_checker: settings.enable_safety_checker,
      }
    } else if (modelId === 'fal-ai/stable-audio') {
      endpoint = 'https://110602490-stable-audio-basic.gateway.alpha.fal.ai/'
      input = {
        prompt: settings.prompt,
        seconds_total: settings.seconds_total || 30,
        steps: settings.steps || 10,
      }
    } else if (modelId === 'fal-ai/speech-to-speech') {
      endpoint = 'https://110602490-f5-tts.gateway.alpha.fal.ai/'
      input = {
        gen_text: settings.gen_text,
        ref_text: settings.ref_text,
        ref_audio_url: settings.audio_url,
        model_type: settings.model_type || "F5-TTS",
        remove_silence: settings.remove_silence ?? true,
      }
    } else {
      throw new Error(`Unsupported model: ${modelId}`)
    }

    console.log('Making request to FAL AI endpoint:', endpoint)
    console.log('With input:', input)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('FAL AI error:', error)
      throw new Error(`FAL AI request failed: ${error}`)
    }

    const data = await response.json()
    console.log('FAL AI response:', data)

    return new Response(JSON.stringify(data), {
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