import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface GenerationHistoryProps {
  type: string;
  modelId: string;
}

export function GenerationHistory({ type, modelId }: GenerationHistoryProps) {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenerations = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data } = await supabase
            .from("generations")
            .select("*")
            .eq("user_id", user.id)
            .eq("model_type", type)
            .eq("model_name", modelId)
            .order("created_at", { ascending: false });

          setGenerations(data || []);
        }
      } catch (error) {
        console.error("Error fetching generations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenerations();
  }, [type, modelId]);

  if (loading) {
    return <div>Loading history...</div>;
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-4">
        <h3 className="font-semibold">Generation History</h3>
        <div className="grid grid-cols-2 gap-4">
          {generations.map((generation) => (
            <div key={generation.id} className="space-y-2">
              <AspectRatio ratio={16/9}>
                <img
                  src={generation.output_url}
                  alt={generation.prompt}
                  className="rounded-lg object-cover w-full h-full"
                />
              </AspectRatio>
              <p className="text-sm text-muted-foreground truncate">
                {generation.prompt}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}