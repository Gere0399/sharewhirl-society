import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const falKey = Deno.env.get('FAL_KEY')
    
    if (!falKey) {
      console.error('FAL API key not configured')
      throw new Error('FAL API key not configured')
    }

    if (!modelId || !settings) {
      console.error('Missing required parameters:', { modelId, settings })
      throw new Error('Missing required parameters')
    }

    console.log('Submitting request to FAL AI:', { modelId, settings })

    try {
      // For Flux models
      if (modelId.includes('flux')) {
        const apiUrl = 'https://rest.fal.ai/v1/image/generate'
        console.log('Making Flux request to:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(settings),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('FAL AI Flux error:', errorText)
          throw new Error(`FAL AI Flux failed: ${errorText}`)
        }

        const data = await response.json()
        console.log('FAL AI Flux response:', data)
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
      
      // For SDXL and other models
      else {
        const apiUrl = 'https://rest.fal.ai/v1/image/generate'
        console.log('Making SDXL request to:', apiUrl)
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            ...settings,
            model_name: modelId
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('FAL AI SDXL error:', errorText)
          throw new Error(`FAL AI SDXL failed: ${errorText}`)
        }

        const data = await response.json()
        console.log('FAL AI SDXL response:', data)
        return new Response(JSON.stringify({ data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        })
      }
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