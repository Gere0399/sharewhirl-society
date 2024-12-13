import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { fal } from "@fal-ai/client";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { gen_text, audio_url, model_type = "F5-TTS", remove_silence = true } = await req.json();

    console.log("Starting speech generation with settings:", { gen_text, audio_url, model_type, remove_silence });

    const result = await fal.subscribe("fal-ai/f5-tts", {
      input: {
        gen_text,
        ref_audio_url: audio_url,
        model_type: model_type as "F5-TTS" | "E2-TTS",
        remove_silence
      },
      logs: true,
    });

    if (!result.data?.audio_url?.url) {
      throw new Error("No audio URL in response");
    }

    return new Response(
      JSON.stringify({ data: result.data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Speech generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});