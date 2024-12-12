import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    const falKey = Deno.env.get('FAL_KEY')
    
    if (!falKey) {
      throw new Error('FAL API key not configured')
    }

    console.log('Submitting request to FAL AI:', { modelId, settings })

    // Submit initial request
    const submitResponse = await fetch(`https://queue.fal.run/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    const submitData = await submitResponse.json()
    console.log('FAL AI submit response:', submitData)

    if (!submitData.request_id) {
      throw new Error('No request ID received from FAL AI')
    }

    // Poll for result
    let attempts = 0
    const maxAttempts = 10
    let result = null

    while (attempts < maxAttempts) {
      const resultResponse = await fetch(`https://queue.fal.run/${modelId}/requests/${submitData.request_id}`, {
        headers: {
          'Authorization': `Key ${falKey}`,
        },
      })

      const resultData = await resultResponse.json()
      console.log('FAL AI result response:', resultData)

      if (resultData.status === 'completed' && resultData.images?.[0]?.url) {
        result = resultData
        break
      }

      if (resultData.status === 'failed') {
        throw new Error('FAL AI generation failed: ' + (resultData.error || 'Unknown error'))
      }

      attempts++
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second between attempts
    }

    if (!result) {
      throw new Error('Timed out waiting for FAL AI response')
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in generate-image function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})