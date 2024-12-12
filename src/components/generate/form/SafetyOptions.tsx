import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface SafetyOptionsProps {
  enableSafetyChecker: boolean;
  setEnableSafetyChecker: (value: boolean) => void;
}

export function SafetyOptions({ enableSafetyChecker, setEnableSafetyChecker }: SafetyOptionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="safety-checker"
        checked={enableSafetyChecker}
        onCheckedChange={setEnableSafetyChecker}
      />
      <Label htmlFor="safety-checker">Enable Safety Checker</Label>
    </div>
  );
}