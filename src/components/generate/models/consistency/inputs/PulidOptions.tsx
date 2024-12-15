import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageSize } from "@/types/generation";

interface PulidOptionsProps {
  imageSize: ImageSize;
  setImageSize: (value: ImageSize) => void;
  enableSafetyChecker: boolean;
  setEnableSafetyChecker: (value: boolean) => void;
}

export function PulidOptions({
  imageSize,
  setImageSize,
  enableSafetyChecker,
  setEnableSafetyChecker
}: PulidOptionsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Resolution</Label>
        <Select value={imageSize} onValueChange={(value) => setImageSize(value as ImageSize)}>
          <SelectTrigger>
            <SelectValue placeholder="Select resolution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="square_hd">Square HD</SelectItem>
            <SelectItem value="square">Square</SelectItem>
            <SelectItem value="portrait_4_3">Portrait 4:3</SelectItem>
            <SelectItem value="portrait_16_9">Portrait 16:9</SelectItem>
            <SelectItem value="landscape_4_3">Landscape 4:3</SelectItem>
            <SelectItem value="landscape_16_9">Landscape 16:9</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label>Enable Safety Checker</Label>
        <Switch
          checked={enableSafetyChecker}
          onCheckedChange={setEnableSafetyChecker}
        />
      </div>
    </div>
  );
}