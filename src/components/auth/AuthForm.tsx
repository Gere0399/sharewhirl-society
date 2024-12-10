import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function AuthForm() {
  const { toast } = useToast();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border/5 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-foreground">Welcome to Neo AI Studios</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "rgb(139, 92, 246)",
                    brandAccent: "rgb(124, 58, 237)",
                    brandButtonText: "white",
                    defaultButtonBackground: "rgb(42, 42, 45)",
                    defaultButtonBackgroundHover: "rgb(55, 55, 58)",
                    defaultButtonBorder: "rgb(64, 64, 67)",
                    defaultButtonText: "white",
                    dividerBackground: "rgb(64, 64, 67)",
                    inputBackground: "rgb(24, 24, 27)",
                    inputBorder: "rgb(64, 64, 67)",
                    inputBorderHover: "rgb(100, 100, 103)",
                    inputBorderFocus: "rgb(139, 92, 246)",
                    inputText: "white",
                    inputPlaceholder: "rgb(156, 163, 175)",
                  },
                },
              },
              className: {
                container: "text-foreground",
                label: "text-foreground",
                button: "bg-primary hover:bg-primary/90",
                input: "bg-background border-border",
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Your password",
                  email_label: "Email address",
                  password_label: "Password",
                  button_label: "Sign in",
                  loading_button_label: "Signing in ...",
                  social_provider_text: "Sign in with {{provider}}",
                  link_text: "Already have an account? Sign in",
                },
                sign_up: {
                  email_input_placeholder: "Your email address",
                  password_input_placeholder: "Create a password (min 6 characters)",
                  email_label: "Email address",
                  password_label: "Create a password",
                  button_label: "Sign up",
                  loading_button_label: "Signing up ...",
                  social_provider_text: "Sign up with {{provider}}",
                  link_text: "Don't have an account? Sign up",
                },
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth/callback`}
          />
        </CardContent>
      </Card>
    </div>
  );
}