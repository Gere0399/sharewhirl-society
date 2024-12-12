import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCredits() {
  const [credits, setCredits] = useState<number | null>(null);

  const fetchCredits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('credits')
        .select('amount')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error("Error fetching credits:", error);
        return;
      }
      
      setCredits(data?.amount ?? 0);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  return { credits, setCredits, fetchCredits };
}