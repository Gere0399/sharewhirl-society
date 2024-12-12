import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { fal } from 'npm:@fal-ai/client'

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
    console.log('Generating with model:', modelId, 'settings:', settings)

    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY not found')
    }

    fal.config({
      credentials: falKey,
    })

    if (modelId === 'fal-ai/stable-audio') {
      const result = await fal.subscribe(modelId, {
        input: {
          prompt: settings.prompt,
          seconds_total: settings.seconds_total || 30,
          steps: settings.steps || 100,
        },
        logs: true,
      })

      console.log('Audio generation result:', result)

      if (!result.data?.audio_file?.url) {
        throw new Error('No audio URL in response')
      }

      return new Response(
        JSON.stringify({
          data: {
            images: [{
              url: result.data.audio_file.url
            }]
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Handle image generation models
    const result = await fal.subscribe(modelId, {
      input: settings,
      logs: true,
    })

    console.log('Image generation result:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})