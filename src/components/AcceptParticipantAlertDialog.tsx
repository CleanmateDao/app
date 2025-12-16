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
import { Check } from "lucide-react";

interface AcceptParticipantAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantName: string | undefined;
  onAccept: () => void;
  onCancel?: () => void;
}

export function AcceptParticipantAlertDialog({
  open,
  onOpenChange,
  participantName,
  onAccept,
  onCancel,
}: AcceptParticipantAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Accept Participant</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to accept <strong>{participantName}</strong> as
            a participant for this cleanup?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onOpenChange(false);
              onCancel?.();
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAccept}>
            <Check className="w-4 h-4 mr-2" />
            Accept
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

