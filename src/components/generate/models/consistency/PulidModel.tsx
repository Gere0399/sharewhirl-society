import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ImageUpload } from "../../form/ImageUpload";
import { PulidPromptInput } from "./inputs/PulidPromptInput";
import { PulidSliders } from "./inputs/PulidSliders";
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
  const [inferenceSteps, setInferenceSteps] = useState(20);
  const [imageSize, setImageSize] = useState<ImageSize>("landscape_4_3");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [guidanceScale, setGuidanceScale] = useState(4);
  const [idWeight, setIdWeight] = useState(1);
  const [trueCfg, setTrueCfg] = useState(1);
  const [negativePrompt, setNegativePrompt] = useState("bad quality, worst quality, text, signature, watermark, extra limbs");
  const [maxSequenceLength, setMaxSequenceLength] = useState<string>("128");

  const handleSubmit = async () => {
    if (!prompt || !file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      console.log("Submitting Pulid generation with settings:", {
        prompt,
        reference_image_url: base64Data,
        image_size: imageSize,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
        negative_prompt: negativePrompt,
        true_cfg: trueCfg,
        id_weight: idWeight,
        enable_safety_checker: enableSafetyChecker,
        max_sequence_length: maxSequenceLength
      });
      
      await onSubmit({
        prompt,
        reference_image_url: base64Data,
        image_size: imageSize,
        num_inference_steps: inferenceSteps,
        guidance_scale: guidanceScale,
        negative_prompt: negativePrompt,
        true_cfg: trueCfg,
        id_weight: idWeight,
        enable_safety_checker: enableSafetyChecker,
        max_sequence_length: maxSequenceLength
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
        maxSequenceLength={maxSequenceLength}
        setMaxSequenceLength={setMaxSequenceLength}
        enableSafetyChecker={enableSafetyChecker}
        setEnableSafetyChecker={setEnableSafetyChecker}
      />

      <PulidSliders
        inferenceSteps={inferenceSteps}
        setInferenceSteps={setInferenceSteps}
        guidanceScale={guidanceScale}
        setGuidanceScale={setGuidanceScale}
        idWeight={idWeight}
        setIdWeight={setIdWeight}
        trueCfg={trueCfg}
        setTrueCfg={setTrueCfg}
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