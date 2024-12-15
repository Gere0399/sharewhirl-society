import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, DollarSign, Badge } from "lucide-react";
import { ImageUpload } from "../../form/ImageUpload";
import { SafetyOptions } from "../../form/SafetyOptions";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [imageSize, setImageSize] = useState<string>("landscape_4_3");
  const [enableSafetyChecker, setEnableSafetyChecker] = useState(true);
  const [guidanceScale, setGuidanceScale] = useState(4);
  const [idWeight, setIdWeight] = useState(1);
  const [trueCfg, setTrueCfg] = useState(1);
  const [negativePrompt, setNegativePrompt] = useState("bad quality, worst quality, text, signature, watermark, extra limbs");

  const handleSubmit = async () => {
    if (!prompt || !file) return;
    
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
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
        max_sequence_length: "128"
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Image Description</Label>
        <Input
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate"
        />
      </div>

      <ImageUpload 
        file={file} 
        setFile={setFile}
        required={true}
      />

      <div className="space-y-2">
        <Label>Resolution</Label>
        <Select value={imageSize} onValueChange={setImageSize}>
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square_hd">Square HD</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
            <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
            <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
            <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Inference Steps ({inferenceSteps})</Label>
        <Slider
          value={[inferenceSteps]}
          onValueChange={(value) => setInferenceSteps(value[0])}
          min={1}
          max={50}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Guidance Scale ({guidanceScale})</Label>
        <Slider
          value={[guidanceScale]}
          onValueChange={(value) => setGuidanceScale(value[0])}
          min={1}
          max={20}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>ID Weight ({idWeight})</Label>
        <Slider
          value={[idWeight]}
          onValueChange={(value) => setIdWeight(value[0])}
          min={0}
          max={5}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>True CFG ({trueCfg})</Label>
        <Slider
          value={[trueCfg]}
          onValueChange={(value) => setTrueCfg(value[0])}
          min={0}
          max={5}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="negativePrompt">Negative Prompt</Label>
        <Input
          id="negativePrompt"
          value={negativePrompt}
          onChange={(e) => setNegativePrompt(e.target.value)}
          placeholder="Enter negative prompt"
        />
      </div>

      <SafetyOptions
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