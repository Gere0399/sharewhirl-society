import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InsufficientCreditsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  modelName: string;
  requiredCredits: number;
}

export function InsufficientCreditsDialog({
  open,
  onOpenChange,
  modelName,
  requiredCredits,
}: InsufficientCreditsDialogProps) {
  const navigate = useNavigate();

  const handleSubscribe = () => {
    onOpenChange(false);
    navigate("/subscriptions");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insufficient Credits</DialogTitle>
          <DialogDescription>
            You need {requiredCredits} credits to use {modelName}. Would you like to purchase more credits?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubscribe}>
            Get More Credits
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}