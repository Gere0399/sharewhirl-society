import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { Sidebar } from "@/components/feed/Sidebar";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 py-2 px-4 bg-background/95 backdrop-blur-sm border-b border-border/10">
              {GENERATION_TYPES.map((type) => (
                <DropdownMenu key={type.id}>
                  <DropdownMenuTrigger className="flex items-center gap-1 text-sm">
                    <span
                      className={`cursor-pointer whitespace-nowrap ${
                        selectedType === type.id
                          ? "text-[hsl(262,83%,74%)]"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {type.label}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  {type.id === "images" && (
                    <DropdownMenuContent align="start">
                      {IMAGE_MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onClick={() => setSelectedModel(model.id)}
                        >
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              ))}
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
      </main>
    </div>
  );
}