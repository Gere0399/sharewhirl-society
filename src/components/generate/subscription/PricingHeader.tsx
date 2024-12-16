import { Wand2, Lock, Share2 } from "lucide-react";

export function PricingHeader() {
  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto mb-16">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-white">
        Made for every media creator,
        <br />
        by creators.
      </h1>
      <p className="text-xl text-gray-400">
        Select a plan to generate content at lighting speed with your favourite AI models
      </p>
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-[#9b87f5]" />
          <span className="text-sm text-gray-400">Most loved AI models</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#9b87f5]" />
          <span className="text-sm text-gray-400">Privacy & Storage</span>
        </div>
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#9b87f5]" />
          <span className="text-sm text-gray-400">Share with the community</span>
        </div>
      </div>
    </div>
  );
}