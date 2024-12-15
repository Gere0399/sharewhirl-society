import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Download } from "lucide-react";

interface GenerationHistoryProps {
  type: string;
  modelId: string;
  refreshTrigger?: number;
}

export function GenerationHistory({ type, modelId, refreshTrigger = 0 }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Fetching generations for user:", user.id, "model:", modelId, "type:", type);
          const { data, error } = await supabase
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .eq("model_name", modelId)
            .order("created_at", { ascending: false });

          if (error) {
            console.error("Error fetching generations:", error);
            return;
          }

          console.log("Fetched generations:", data);
          setGenerations(data || []);
        }
      } catch (error) {
        console.error("Error fetching generations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [type, modelId, refreshTrigger]);

  const handleDownload = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const fileName = `${prompt.slice(0, 30).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}${type === 'audio' || type === 'speech' ? '.mp3' : '.png'}`;
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  if (loading) {
    return <div>Loading history...</div>;
  }

  const renderGenerationItem = (generation: any) => {
    if (type === "audio" || type === "speech") {
      return (
        <div className="space-y-2 relative group">
          <audio 
            controls 
            src={generation.output_url}
            className="w-full"
          />
          <button
            onClick={() => handleDownload(generation.output_url, generation.prompt)}
            className="absolute top-2 right-2 p-2 bg-black/60 rounded hover:bg-black/80 transition-colors invisible group-hover:visible"
          >
            <Download className="h-4 w-4 text-white" />
          </button>
          <p className="text-sm text-muted-foreground truncate">
            {generation.prompt}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2 relative group">
        <AspectRatio ratio={16/9}>
          <img
            src={generation.output_url}
            alt={generation.prompt}
            className="rounded-lg object-cover w-full h-full"
          />
          <button
            onClick={() => handleDownload(generation.output_url, generation.prompt)}
            className="absolute top-2 right-2 p-2 bg-black/60 rounded hover:bg-black/80 transition-colors invisible group-hover:visible"
          >
            <Download className="h-4 w-4 text-white" />
          </button>
        </AspectRatio>
        <p className="text-sm text-muted-foreground truncate">
          {generation.prompt}
        </p>
      </div>
    );
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Generation History</h3>
        {generations.length === 0 ? (
          <p className="text-muted-foreground">No generations yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {generations.map((generation) => (
              <div key={generation.id}>
                {renderGenerationItem(generation)}
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}