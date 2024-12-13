import { fal } from "@fal-ai/client";

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

  const result = await fal.subscribe("stable-audio-basic", {
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

  return result.data;
}