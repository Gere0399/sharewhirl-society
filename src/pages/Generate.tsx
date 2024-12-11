import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";

const GENERATION_TYPES = [
  { id: "images", label: "Images" },
  { id: "consistency", label: "Consistency" },
  { id: "video", label: "Video" },
  { id: "speech", label: "Speech" },
  { id: "sounds", label: "Sounds" },
  { id: "songs", label: "Songs" },
];

const IMAGE_MODELS = [
  { id: "fal-ai/flux-pro/v1/canny", label: "Flux Pro Canny" },
  { id: "fal-ai/flux-pro/v1/ultra", label: "Flux Pro Ultra" },
  { id: "fal-ai/flux-pro/v1/redux", label: "Flux Pro Redux" },
];

export default function Generate() {
  const [selectedType, setSelectedType] = useState("images");
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
          <div className="flex gap-4">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {GENERATION_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedType === "images" && (
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {IMAGE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              {selectedType === "images" && (
                <GenerateImage modelId={selectedModel} />
              )}
            </Card>
            <Card className="p-4">
              <GenerationHistory type={selectedType} modelId={selectedModel} />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}