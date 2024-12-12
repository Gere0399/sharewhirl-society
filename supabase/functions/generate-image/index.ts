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
      const submitResponse = await fetch(`https://queue.fal.run/${modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
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

      if (!submitData.request_id) {
        throw new Error('No request ID received from FAL AI')
      }

      // Poll for result
      let attempts = 0
      const maxAttempts = 30 // Increased max attempts
      let result = null

      while (attempts < maxAttempts) {
        console.log(`Polling attempt ${attempts + 1} for request ${submitData.request_id}`)
        
        const resultResponse = await fetch(`https://queue.fal.run/${modelId}/requests/${submitData.request_id}`, {
          headers: {
            'Authorization': `Key ${falKey}`,
          },
        })

        if (!resultResponse.ok) {
          const errorText = await resultResponse.text()
          console.error('FAL AI result error:', errorText)
          throw new Error(`FAL AI result failed: ${errorText}`)
        }

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
        await new Promise(resolve => setTimeout(resolve, 2000)) // Increased wait time to 2 seconds
      }

      if (!result) {
        throw new Error('Timed out waiting for FAL AI response')
      }

      return new Response(JSON.stringify({ data: result }), {
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