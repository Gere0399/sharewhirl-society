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
      let apiUrl = 'https://rest.fal.ai/v1/images/models/'
      
      // Determine the correct endpoint based on model
      if (modelId.includes('flux/schnell')) {
        apiUrl += 'flux-schnell/generate'
      } else if (modelId.includes('flux')) {
        apiUrl += 'flux/generate'
      } else if (modelId.includes('stable-diffusion-xl')) {
        apiUrl += 'stable-diffusion-xl-v1/generate'
      }

      console.log('Making request to:', apiUrl)
      
      const requestBody = {
        prompt: settings.prompt,
        image_size: settings.image_size,
        num_inference_steps: settings.num_inference_steps,
        num_images: settings.num_images || 1,
        enable_safety_checker: settings.enable_safety_checker
      }

      if (settings.guidance_scale) {
        requestBody.guidance_scale = settings.guidance_scale
      }

      console.log('Request body:', requestBody)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${falKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('FAL AI error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`FAL AI failed: ${errorText}`)
      }

      const data = await response.json()
      console.log('FAL AI successful response:', data)
      
      return new Response(JSON.stringify({ data }), {
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