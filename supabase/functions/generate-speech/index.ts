import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const { gen_text, ref_audio_url, ref_text, model_type, remove_silence } = await req.json()
    
    if (!gen_text || !ref_audio_url) {
      throw new Error('Missing required parameters')
    }

    console.log('Starting speech generation with settings:', { gen_text, ref_audio_url, ref_text, model_type, remove_silence })

    // Configure fal client
    fal.config({
      credentials: Deno.env.get('FAL_KEY')
    })

    const result = await fal.subscribe('fal-ai/f5-tts', {
      input: {
        gen_text,
        ref_audio_url,
        ref_text: ref_text || '',
        model_type: model_type || 'F5-TTS',
        remove_silence: remove_silence ?? true
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach(console.log)
        }
      },
    })

    console.log('Speech generation completed:', result)

    return new Response(
      JSON.stringify({ audio_url: result.data.audio_url.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Speech generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})