import { supabase } from "@/integrations/supabase/client";

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

  // Call the edge function to handle FAL AI interaction and storage
  const { data, error } = await supabase.functions.invoke('generate-stable-audio', {
    body: input
  });

  if (error) {
    console.error('Error generating audio:', error);
    throw error;
  }

  if (!data?.audio_file?.url) {
    throw new Error("No audio URL in response");
  }

  return data as StableAudioOutput;
}