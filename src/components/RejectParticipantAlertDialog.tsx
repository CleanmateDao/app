import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface RejectParticipantAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantName: string | undefined;
  rejectReason: string;
  onRejectReasonChange: (reason: string) => void;
  onReject: () => void;
  onCancel?: () => void;
}

export function RejectParticipantAlertDialog({
  open,
  onOpenChange,
  participantName,
  rejectReason,
  onRejectReasonChange,
  onReject,
  onCancel,
}: RejectParticipantAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Participant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to reject <strong>{participantName}</strong>?
            You can provide an optional reason below.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Label htmlFor="reject-reason">Reason (optional)</Label>
          <Textarea
            id="reject-reason"
            placeholder="Enter a reason for rejection..."
            value={rejectReason}
            onChange={(e) => onRejectReasonChange(e.target.value)}
            className="mt-2"
            rows={3}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onOpenChange(false);
              onCancel?.();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onReject}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <X className="w-4 h-4 mr-2" />
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

