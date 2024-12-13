import { fal } from "npm:@fal-ai/client";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export interface StableAudioInput {
  prompt: string;
  seconds_total?: number;
  steps?: number;
}

export interface StableAudioOutput {
  audio_file: {
    url: string;
    content_type: string;
    file_name: string;
    file_size: number;
  };
}

export async function generateStableAudio(input: StableAudioInput): Promise<StableAudioOutput> {
  console.log('Generating audio with settings:', input);
  
  if (!input.prompt) {
    throw new Error("Prompt is required for audio generation");
  }

  // Configure FAL AI client
  const falKey = Deno.env.get('FAL_KEY');
  if (!falKey) {
    throw new Error('FAL_KEY not found in environment');
  }
  
  fal.config({
    credentials: falKey
  });

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

  console.log('Stable Audio response:', result);

  if (!result.data.audio_file?.url) {
    throw new Error("No audio URL in response from FAL AI");
  }

  // Save the file to Supabase storage
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

  return {
    audio_file: {
      ...result.data.audio_file,
      url: publicUrl
    }
  };
}