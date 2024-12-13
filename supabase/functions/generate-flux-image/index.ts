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

    console.log('FAL AI response received:', result);

    if (!result.data) {
      throw new Error('No response data received from FAL AI');
    }

    // Create a Supabase client with service role key for storage operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Extract image URL from the response
    let imageUrl;
    if (result.data.images && Array.isArray(result.data.images) && result.data.images.length > 0) {
      imageUrl = result.data.images[0].url;
    } else if (result.data.image && typeof result.data.image === 'string') {
      imageUrl = result.data.image;
    }

    if (!imageUrl) {
      console.error('No image URL found in response:', result.data);
      throw new Error('No image URL in response');
    }

    console.log('Downloading image from:', imageUrl);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const imageBlob = await response.blob();
    const fileName = `${crypto.randomUUID()}.jpg`;
    const filePath = `generated/${fileName}`;

    console.log('Uploading image to Supabase Storage:', filePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated')
      .upload(filePath, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    console.log('Image uploaded successfully:', uploadData);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated')
      .getPublicUrl(filePath);

    console.log('Public URL generated:', publicUrl);

    // Return the result with the stored image URL
    return new Response(JSON.stringify({ 
      data: {
        ...result,
        data: {
          ...result.data,
          images: [{
            ...result.data.images?.[0],
            url: publicUrl
          }]
        }
      }
    }), {
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