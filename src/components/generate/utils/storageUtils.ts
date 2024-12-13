import { supabase } from "@/integrations/supabase/client";

export const saveToStorage = async (url: string, modelType: string): Promise<string> => {
  try {
    // For audio files, we'll store the URL directly since we can't fetch it due to CORS
    if (modelType === 'speech') {
      return url;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const fileExt = url.split('.').pop() || 'jpg';
    const filePath = `${modelType}/${crypto.randomUUID()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('generated')
      .upload(filePath, blob);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('generated')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error("Error saving to storage:", error);
    throw error;
  }
};