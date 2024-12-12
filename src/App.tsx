import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Index from "./pages/Index";
import CreatePost from "./pages/CreatePost";
import AuthCallback from "./components/auth/AuthCallback";
import UpdatePassword from "./pages/UpdatePassword";
import Profile from "./pages/Profile";
import PostView from "./pages/PostView";
import Notifications from "./pages/Notifications";
import Generate from "./pages/Generate";
import Subscriptions from "./pages/Subscriptions";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="app-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="/post/:postId" element={<PostView />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/generate" element={<Generate />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;