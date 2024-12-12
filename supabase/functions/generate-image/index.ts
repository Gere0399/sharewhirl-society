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
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      console.error('FAL API key not configured')
      throw new Error('FAL API key not configured')
    }

    const { modelId, settings } = await req.json()

    if (!modelId || !settings) {
      console.error('Missing required parameters:', { modelId, settings })
      throw new Error('Missing required parameters')
    }

    console.log('Submitting request to FAL AI:', { modelId, settings })

    try {
      // First, submit the request to the queue
      const queueUrl = 'https://queue.fal.run/' + modelId
      console.log('Submitting to queue:', queueUrl)

      const requestBody = {
        input: {
          prompt: settings.prompt,
          image_size: settings.image_size,
          num_inference_steps: settings.num_inference_steps,
          num_images: settings.num_images || 1,
          enable_safety_checker: settings.enable_safety_checker
        }
      }

      if (settings.guidance_scale) {
        requestBody.input.guidance_scale = settings.guidance_scale
      }

      console.log('Queue request body:', requestBody)

      const queueResponse = await fetch(queueUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!queueResponse.ok) {
        const errorText = await queueResponse.text()
        console.error('FAL AI queue error:', {
          status: queueResponse.status,
          statusText: queueResponse.statusText,
          body: errorText
        })
        throw new Error(`FAL AI queue submission failed: ${errorText}`)
      }

      const queueData = await queueResponse.json()
      console.log('Queue submission response:', queueData)

      // Now poll for the result using GET method
      const statusUrl = `https://queue.fal.run/${modelId}/status/${queueData.request_id}`
      console.log('Polling for status at:', statusUrl)

      let attempts = 0
      const maxAttempts = 30
      let result = null

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Key ${falKey}`,
            'Accept': 'application/json',
          },
        })

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text()
          console.error('FAL AI status fetch error:', {
            status: statusResponse.status,
            statusText: statusResponse.statusText,
            body: errorText
          })
          throw new Error(`FAL AI status fetch failed: ${errorText}`)
        }

        const statusData = await statusResponse.json()
        console.log('Status poll response:', statusData)

        if (statusData.status === 'COMPLETED') {
          result = statusData
          break
        }

        if (statusData.status === 'FAILED') {
          throw new Error(`FAL AI job failed: ${statusData.error || 'Unknown error'}`)
        }

        attempts++
        // Increase wait time between attempts
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      if (!result) {
        throw new Error('FAL AI job timed out')
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