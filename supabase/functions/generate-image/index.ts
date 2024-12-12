import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { fal } from "npm:@fal-ai/client"

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

    fal.config({ credentials: falKey })

    let result;

    if (modelId === 'fal-ai/flux/schnell') {
      const response = await fetch('https://110602490-flux-schnell.gateway.alpha.fal.ai/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: settings.prompt,
            image_size: settings.image_size || "landscape_16_9",
            num_images: settings.num_images || 1,
            num_inference_steps: settings.num_inference_steps || 4,
            enable_safety_checker: settings.enable_safety_checker,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('FAL AI error:', error)
        throw new Error(`FAL AI request failed: ${error}`)
      }

      result = await response.json()
    } else if (modelId === 'fal-ai/flux/schnell/redux') {
      const response = await fetch('https://110602490-flux-schnell-redux.gateway.alpha.fal.ai/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: settings.prompt || "enhance this image",
            image_url: settings.image_url,
            image_size: settings.image_size || "landscape_16_9",
            num_images: settings.num_images || 1,
            num_inference_steps: settings.num_inference_steps || 4,
            enable_safety_checker: settings.enable_safety_checker,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('FAL AI error:', error)
        throw new Error(`FAL AI request failed: ${error}`)
      }

      result = await response.json()
    } else if (modelId === 'fal-ai/stable-audio') {
      const response = await fetch('https://110602490-stable-audio-basic.gateway.alpha.fal.ai/', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            prompt: settings.prompt,
            seconds_total: settings.seconds_total || 30,
            steps: settings.steps || 10,
          }
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('FAL AI error:', error)
        throw new Error(`FAL AI request failed: ${error}`)
      }

      result = await response.json()
    } else if (modelId === 'fal-ai/speech-to-speech') {
      console.log('Making speech-to-speech request with settings:', settings)
      result = await fal.subscribe('fal-ai/f5-tts', {
        input: {
          gen_text: settings.gen_text,
          ref_text: settings.ref_text || undefined,
          ref_audio_url: settings.audio_url,
          model_type: settings.model_type || "F5-TTS",
          remove_silence: settings.remove_silence ?? true,
        },
        logs: true,
      })
      console.log('Speech-to-speech response:', result)
    } else {
      throw new Error(`Unsupported model: ${modelId}`)
    }

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