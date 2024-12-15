import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ImageSize } from "@/types/generation";

interface PulidOptionsProps {
  imageSize: ImageSize;
  setImageSize: (value: ImageSize) => void;
  maxSequenceLength: string;
  setMaxSequenceLength: (value: string) => void;
  enableSafetyChecker: boolean;
  setEnableSafetyChecker: (value: boolean) => void;
}

export function PulidOptions({
  imageSize,
  setImageSize,
  maxSequenceLength,
  setMaxSequenceLength,
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

      <div className="space-y-2">
        <Label>Max Sequence Length</Label>
        <Select value={maxSequenceLength} onValueChange={setMaxSequenceLength}>
          <SelectTrigger>
            <SelectValue placeholder="Select sequence length" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="128">128</SelectItem>
            <SelectItem value="256">256</SelectItem>
            <SelectItem value="512">512</SelectItem>
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