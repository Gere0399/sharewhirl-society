import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
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
    console.log('Received request for speech generation:', { modelId, settings })

    // Configure FAL AI client
    fal.config({
      credentials: Deno.env.get('FAL_KEY'),
    })

    console.log('Submitting request to FAL AI...')
    const result = await fal.subscribe(modelId, {
      input: {
        gen_text: settings.gen_text,
        ref_audio_url: settings.audio_url,
        ref_text: settings.ref_text,
        model_type: settings.model_type,
        remove_silence: settings.remove_silence ?? true,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    })

    console.log('Received response from FAL AI:', result)

    if (!result.data?.audio_url?.url) {
      throw new Error('No audio URL in response')
    }

    return new Response(
      JSON.stringify({
        data: {
          audio_url: result.data.audio_url.url,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in speech generation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})