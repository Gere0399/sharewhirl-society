import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GenerateImage } from "@/components/generate/GenerateImage";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { Sidebar } from "@/components/feed/Sidebar";
import { ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const GENERATION_TYPES = [
  { id: "images", label: "Images" },
  { id: "consistency", label: "Consistency" },
  { id: "video", label: "Video" },
  { id: "speech", label: "Speech" },
  { id: "sounds", label: "Sounds" },
  { id: "songs", label: "Songs" },
];

const IMAGE_MODELS = [
  { id: "flux-pro", label: "Flux Pro" },
  { id: "flux-pro-ultra", label: "Flux Pro Ultra" },
];

export default function Generate() {
  const [selectedType, setSelectedType] = useState(GENERATION_TYPES[0].id);
  const [selectedModel, setSelectedModel] = useState(IMAGE_MODELS[0].id);
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4 max-w-6xl mx-auto">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-4 py-2 px-4 bg-background/95 backdrop-blur-sm border-b border-border/10">
                {GENERATION_TYPES.map((type) => (
                  <DropdownMenu key={type.id}>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-sm whitespace-nowrap">
                      <span
                        className={`cursor-pointer ${
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
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                {selectedType === "images" && (
                  <GenerateImage modelId={selectedModel} />
                )}
              </Card>
              <Card className="p-4 overflow-x-hidden bg-[#111111]">
                <GenerationHistory type={selectedType} modelId={selectedModel} />
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}