import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "npm:@fal-ai/client"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

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
    console.log('Received request for Flux model:', modelId, 'with settings:', settings)

    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY not found in environment variables')
    }

    fal.config({
      credentials: falKey
    });

    // Ensure inference steps are within limits
    const validatedSettings = {
      ...settings,
      num_inference_steps: Math.min(settings.num_inference_steps || 4, 12),
      num_images: 1,
    };

    // For image-to-image model, ensure image_url is present
    if (modelId === 'fal-ai/flux/schnell/redux' && !settings.image_url) {
      throw new Error('Image URL is required for image-to-image model');
    }

    console.log('Submitting request with validated settings:', validatedSettings);

    const result = await fal.subscribe(modelId, {
      input: validatedSettings,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    // Create a Supabase client with service role key for storage operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Save the generated image to Supabase Storage
    if (result.data.images?.[0]?.url) {
      const imageUrl = result.data.images[0].url;
      const response = await fetch(imageUrl);
      const imageBlob = await response.blob();

      // Upload to storage
      const fileName = `${crypto.randomUUID()}.jpg`;
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('generated')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (storageError) {
        throw storageError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('generated')
        .getPublicUrl(fileName);

      // Return the result with the stored image URL
      return new Response(JSON.stringify({ 
        data: {
          ...result,
          data: {
            ...result.data,
            images: [{
              ...result.data.images[0],
              url: publicUrl
            }]
          }
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})