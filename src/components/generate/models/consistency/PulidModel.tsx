import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ImageUpload } from "../../form/ImageUpload";
import { PulidPromptInput } from "./inputs/PulidPromptInput";
import { PulidOptions } from "./inputs/PulidOptions";
import { ImageSize } from "@/types/generation";

interface PulidModelProps {
  onSubmit: (settings: any) => Promise<void>;
  loading: boolean;
  disabled: boolean;
  modelCost: number;
  hasFreeDaily?: boolean;
  freeDailyLimit?: number;
  dailyGenerations?: number;
}

export function PulidModel({
  onSubmit,
  loading,
  disabled,
  modelCost,
  hasFreeDaily,
  freeDailyLimit = 0,
  dailyGenerations = 0
}: PulidModelProps) {
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_4_3");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState("bad quality, worst quality, text, signature, watermark, extra limbs");

  const handleSubmit = async () => {
    if (!prompt || !file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      console.log("Submitting Pulid generation with settings:", {
        prompt,
        reference_image_url: base64Data,
        image_size: imageSize,
        num_inference_steps: 25, // Default value as per FAL documentation
        guidance_scale: 7.5, // Default value as per FAL documentation
        negative_prompt: negativePrompt,
        enable_safety_checker: enableSafetyChecker
      });
      
      await onSubmit({
        prompt,
        reference_image_url: base64Data,
        image_size: imageSize,
        num_inference_steps: 25,
        guidance_scale: 7.5,
        negative_prompt: negativePrompt,
        enable_safety_checker: enableSafetyChecker
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <ImageUpload 
        file={file} 
        setFile={setFile}
        required={true}
      />

      <PulidPromptInput
        prompt={prompt}
        setPrompt={setPrompt}
        negativePrompt={negativePrompt}
        setNegativePrompt={setNegativePrompt}
      />

      <PulidOptions
        imageSize={imageSize}
        setImageSize={setImageSize}
        enableSafetyChecker={enableSafetyChecker}
        setEnableSafetyChecker={setEnableSafetyChecker}
      />

      <Button 
        onClick={handleSubmit} 
        disabled={disabled || loading || !prompt || !file}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>Generate</span>
            {hasFreeDaily && dailyGenerations < freeDailyLimit ? (
              <span className="flex items-center gap-1 text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">
                <Badge className="h-3 w-3" />
                <span>{freeDailyLimit - dailyGenerations} free left</span>
              </span>
            ) : (
              <span className="ml-2 text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {modelCost}
              </span>
            )}
          </div>
        )}
      </Button>
    </div>
  );
}