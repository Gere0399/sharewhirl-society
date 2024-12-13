import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { fal } from "npm:@fal-ai/client";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();
    console.log('Received input:', input);

    // Configure FAL AI client
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      throw new Error('FAL_KEY not found in environment');
    }
    
    fal.config({
      credentials: falKey
    });

    // Generate image with FAL AI
    const result = await fal.subscribe(input.modelId, {
      input: input.settings,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      }
    });

    console.log('FAL AI response:', result);

    // Get Supabase credentials from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Extract image URL from the response
    const imageUrl = result.data.images?.[0]?.url;
    if (!imageUrl) {
      console.error('Response structure:', result.data);
      throw new Error('No image URL in response');
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `flux/${timestamp}_${crypto.randomUUID()}.jpg`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('generated')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading to storage:', uploadError);
      throw uploadError;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated')
      .getPublicUrl(filename);

    console.log('Public URL generated:', publicUrl);

    // Return the result with the stored image URL
    return new Response(JSON.stringify({
      data: {
        images: [{
          url: publicUrl,
          content_type: 'image/jpeg'
        }],
        timings: result.data.timings,
        seed: result.data.seed,
        has_nsfw_concepts: result.data.has_nsfw_concepts,
        prompt: result.data.prompt
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});