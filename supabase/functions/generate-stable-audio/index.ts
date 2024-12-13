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

    // Generate audio with FAL AI
    const result = await fal.subscribe("fal-ai/stable-audio", {
      input: {
        prompt: input.prompt,
        seconds_total: input.seconds_total || 30,
        steps: input.steps || 100
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      }
    });

    console.log('FAL AI response:', result);

    if (!result.data.audio_file?.url) {
      throw new Error("No audio URL in response from FAL AI");
    }

    // Save to Supabase storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Download the audio file
    const audioResponse = await fetch(result.data.audio_file.url);
    const audioBlob = await audioResponse.blob();

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const filename = `stable-audio/${timestamp}_${crypto.randomUUID()}.wav`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('generated')
      .upload(filename, audioBlob, {
        contentType: 'audio/wav',
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

    // Return the complete audio file object with all required properties
    return new Response(JSON.stringify({
      audio_file: {
        url: publicUrl,
        content_type: result.data.audio_file.content_type,
        file_name: result.data.audio_file.file_name,
        file_size: result.data.audio_file.file_size
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});