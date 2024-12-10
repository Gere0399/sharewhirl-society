import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading content" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "misinformation", label: "Misinformation" },
  { value: "copyright", label: "Copyright violation" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

interface ReportPostDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle: string;
}

export function ReportPostDialog({
  isOpen,
  onClose,
  postId,
  postTitle,
}: ReportPostDialogProps) {
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/report-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          postTitle,
          reason,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit report");

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe",
      });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Please select a reason for reporting this post. Our team will review it
            as soon as possible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((reason) => (
                <SelectItem key={reason.value} value={reason.value}>
                  {reason.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}