import { Loader } from "lucide-react";
import { Sidebar } from "@/components/feed/Sidebar";

interface PostViewLoadingProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

export function PostViewLoading({ isCreatePostOpen, setIsCreatePostOpen }: PostViewLoadingProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCreatePostOpen={isCreatePostOpen}
        setIsCreatePostOpen={setIsCreatePostOpen}
      />
      <div className="ml-64">
        <div className="flex justify-center items-center min-h-screen">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      </div>
    </div>
  );
}