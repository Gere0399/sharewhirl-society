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
        // Get the access token and type from the URL
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
            navigate("/");
          } else {
            // Different messages based on the type of auth callback
            const messages = {
              signup: "Email confirmed successfully! Welcome to ShareWhirl!",
              recovery: "Password reset successful! You can now log in with your new password.",
              magiclink: "Logged in successfully!",
              default: "Authentication successful!"
            };

            toast({
              title: "Success",
              description: messages[type] || messages.default,
            });
            
            // If it's a password recovery, redirect to password change page
            if (type === 'recovery') {
              navigate("/update-password");
            } else {
              // For all other cases, redirect to the feed after a short delay
              setTimeout(() => {
                navigate("/");
              }, 1000);
            }
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