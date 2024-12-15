import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface PulidSlidersProps {
  inferenceSteps: number;
  setInferenceSteps: (value: number) => void;
  guidanceScale: number;
  setGuidanceScale: (value: number) => void;
  idWeight: number;
  setIdWeight: (value: number) => void;
  trueCfg: number;
  setTrueCfg: (value: number) => void;
}

export function PulidSliders({
  inferenceSteps,
  setInferenceSteps,
  guidanceScale,
  setGuidanceScale,
  idWeight,
  setIdWeight,
  trueCfg,
  setTrueCfg
}: PulidSlidersProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Inference Steps ({inferenceSteps})</Label>
        <Slider
          value={[inferenceSteps]}
          onValueChange={(value) => setInferenceSteps(value[0])}
          min={1}
          max={50}
          step={1}
        />
      </div>

      <div className="space-y-2">
        <Label>Guidance Scale ({guidanceScale})</Label>
        <Slider
          value={[guidanceScale]}
          onValueChange={(value) => setGuidanceScale(value[0])}
          min={1}
          max={20}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>ID Weight ({idWeight})</Label>
        <Slider
          value={[idWeight]}
          onValueChange={(value) => setIdWeight(value[0])}
          min={0}
          max={5}
          step={0.1}
        />
      </div>

      <div className="space-y-2">
        <Label>True CFG ({trueCfg})</Label>
        <Slider
          value={[trueCfg]}
          onValueChange={(value) => setTrueCfg(value[0])}
          min={0}
          max={5}
          step={0.1}
        />
      </div>
    </div>
  );
}