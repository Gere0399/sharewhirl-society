import { Sidebar } from "@/components/feed/Sidebar";
import { GenerationForm } from "@/components/generate/GenerationForm";
import { GenerationHistory } from "@/components/generate/GenerationHistory";
import { CreditDisplay } from "@/components/generate/CreditDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCredits } from "@/components/generate/hooks/useCredits";
import { ModelType } from "@/types/generation";

interface GenerateProps {
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
}

const Generate = ({ isCreatePostOpen, setIsCreatePostOpen }: GenerateProps) => {
  const isMobile = useIsMobile();
  const { data: credits, refetch: refetchCredits } = useCredits();
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleGenerationSuccess = () => {
    refetchCredits();
    setRefreshHistory(prev => prev + 1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCreatePostOpen={isCreatePostOpen} setIsCreatePostOpen={setIsCreatePostOpen} />
      <main className={`flex-1 ${isMobile ? 'mb-16' : 'ml-16'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Generate</h1>
            <CreditDisplay credits={credits || 0} />
            <div className="mt-8">
              <GenerationForm 
                onSubmit={async () => {}}
                loading={false}
                disabled={false}
                modelType="text-to-image"
                modelCost={1}
                onSuccess={handleGenerationSuccess}
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Generation History</h2>
              <GenerationHistory 
                type="text-to-image"
                modelId="default"
                refreshTrigger={refreshHistory}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Generate;