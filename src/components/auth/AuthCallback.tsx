import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the access token from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken) {
          const { error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Auth callback error:", error);
            toast({
              title: "Authentication Error",
              description: error.message,
              variant: "destructive",
            });
            // Redirect to login page if there's an error
            navigate("/");
          } else {
            // Different messages based on the type of auth callback
            const messages = {
              signup: "Email confirmed successfully!",
              recovery: "Password reset successful!",
              magiclink: "Logged in successfully!",
              default: "Authentication successful!"
            };

            toast({
              title: "Success",
              description: messages[type] || messages.default,
            });
            
            // Ensure we redirect to the feed page after a short delay
            // This gives time for the session to be properly set
            setTimeout(() => {
              navigate("/");
            }, 1000);
          }
        } else {
          // If no access token is found, redirect to the login page
          navigate("/");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        toast({
          title: "Error",
          description: "An error occurred during authentication",
          variant: "destructive",
        });
        // Redirect to login page if there's an error
        navigate("/");
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse">Processing authentication...</div>
    </div>
  );
};

export default AuthCallback;