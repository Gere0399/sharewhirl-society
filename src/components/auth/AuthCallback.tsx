import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const hash = window.location.hash;
      if (hash) {
        const { error } = await supabase.auth.getSession();
        if (error) {
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Email confirmed successfully!",
          });
        }
      }
      navigate("/");
    };

    handleAuthCallback();
  }, [navigate]);

  return null;
};

export default AuthCallback;