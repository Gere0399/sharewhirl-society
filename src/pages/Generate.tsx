import { useState } from "react";
import { Sidebar } from "@/components/feed/Sidebar";
import { GenerationForm } from "@/components/generate/GenerationForm";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { CreditDisplay } from "@/components/generate/CreditDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCredits } from "@/components/generate/hooks/useCredits";

interface GenerateProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

const Generate = ({ isCreatePostOpen, setIsCreatePostOpen }: GenerateProps) => {
  const [refreshHistory, setRefreshHistory] = useState(0);
  const isMobile = useIsMobile();
  const { credits } = useCredits();

  const handleGenerationSuccess = () => {
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold">Generate</h1>
                <CreditDisplay credits={credits} />
              </div>
              
              <GenerationForm 
                onSubmit={async () => {}}
                loading={false}
                disabled={false}
                modelType="image"
                modelCost={1}
                onSuccess={handleGenerationSuccess}
              />
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Generation History</h2>
                <GenerationHistory 
                  type="image"
                  modelId="default"
                  refreshTrigger={refreshHistory}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generate;