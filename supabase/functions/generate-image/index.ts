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

    // Submit initial request
    try {
      const submitResponse = await fetch(`https://api.fal.ai/v1/models/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text()
        console.error('FAL AI submit error:', errorText)
        throw new Error(`FAL AI submit failed: ${errorText}`)
      }

      const submitData = await submitResponse.json()
      console.log('FAL AI submit response:', submitData)

      if (!submitData.images?.[0]?.url) {
        throw new Error('No image URL received from FAL AI')
      }

      return new Response(JSON.stringify({ data: submitData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
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