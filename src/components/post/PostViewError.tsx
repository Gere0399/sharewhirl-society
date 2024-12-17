import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Sidebar } from "@/components/feed/Sidebar";

interface PostViewErrorProps {
  onGoHome: () => void;
  isNotFound?: boolean;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

export function PostViewError({ 
  onGoHome, 
  isNotFound = false,
  isCreatePostOpen,
  setIsCreatePostOpen 
}: PostViewErrorProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCreatePostOpen={isCreatePostOpen}
        setIsCreatePostOpen={setIsCreatePostOpen}
      />
      <div className="ml-64">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-muted-foreground mb-4">
            {isNotFound ? "Post not found" : "Failed to load post"}
          </p>
          <Button variant="ghost" onClick={onGoHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}