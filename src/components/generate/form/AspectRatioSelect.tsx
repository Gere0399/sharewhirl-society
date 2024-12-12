import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageSize } from "@/types/generation";

interface AspectRatioSelectProps {
  imageSize: ImageSize;
  setImageSize: (size: ImageSize) => void;
}

export function AspectRatioSelect({ imageSize, setImageSize }: AspectRatioSelectProps) {
  return (
    <div className="space-y-2">
      <Label>Aspect Ratio</Label>
      <Select value={imageSize as string} onValueChange={(value) => setImageSize(value as ImageSize)}>
        <SelectTrigger>
          <SelectValue placeholder="Select aspect ratio" />
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
  );
}