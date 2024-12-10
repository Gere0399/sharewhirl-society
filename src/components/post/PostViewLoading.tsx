import { Loader } from "lucide-react";
import { Sidebar } from "@/components/feed/Sidebar";

export function PostViewLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <div className="flex justify-center items-center min-h-screen">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      </div>
    </div>
  );
}