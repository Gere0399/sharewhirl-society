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

    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      throw new Error('FAL_KEY not found in environment');
    }
    
    fal.config({
      credentials: falKey
    });

    const result = await fal.subscribe("fal-ai/flux-pulid", {
      input: input.settings,
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      }
    });

    console.log('FAL AI response:', result);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const imageUrl = result.data.images?.[0]?.url;
    if (!imageUrl) {
      console.error('Response structure:', result.data);
      throw new Error('No image URL in response');
    }

    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const timestamp = new Date().getTime();
    const filename = `consistency/${timestamp}_${crypto.randomUUID()}.jpg`;

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

    const { data: { publicUrl } } = supabase.storage
      .from('generated')
      .getPublicUrl(filename);

    console.log('Public URL generated:', publicUrl);

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