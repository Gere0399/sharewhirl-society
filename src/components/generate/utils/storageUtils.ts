import { supabase } from "@/integrations/supabase/client";

export const saveToStorage = async (imageUrl: string, modelType: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const fileExt = imageUrl.split('.').pop() || 'jpg';
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