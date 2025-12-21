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
import { Loader2, Play, CheckCircle } from "lucide-react";
import { CleanupStatusUI } from "@/types/cleanup";

interface UpdateCleanupStatusAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus: CleanupStatusUI;
  newStatus: CleanupStatusUI;
  onConfirm: () => void;
  isUpdating?: boolean;
}

const statusLabels: Record<CleanupStatusUI, string> = {
  unpublished: "Unpublished",
  open: "Open for Registration",
  in_progress: "In Progress",
  completed: "Completed",
  rewarded: "Rewards Distributed",
};

const statusMessages: Record<
  CleanupStatusUI,
  { title: string; description: string }
> = {
  unpublished: {
    title: "Unpublish Cleanup",
    description: "This will unpublish the cleanup and make it unavailable.",
  },
  open: {
    title: "Open Cleanup",
    description: "This will open the cleanup for participant registration.",
  },
  in_progress: {
    title: "Start Cleanup",
    description:
      "This will change the cleanup status to 'In Progress'. Participants will no longer be able to apply, and you can begin the cleanup work.",
  },
  completed: {
    title: "Complete Cleanup",
    description:
      "This will mark the cleanup as 'Completed'. Make sure all cleanup work has been finished before confirming.",
  },
  rewarded: {
    title: "Mark as Rewarded",
    description: "This will mark the cleanup as having rewards distributed.",
  },
};

export function UpdateCleanupStatusAlertDialog({
  open,
  onOpenChange,
  currentStatus,
  newStatus,
  onConfirm,
  isUpdating = false,
}: UpdateCleanupStatusAlertDialogProps) {
  const message = statusMessages[newStatus];
  const Icon = newStatus === "in_progress" ? Play : CheckCircle;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {message.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{message.description}</p>
            <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="text-xs text-muted-foreground">Current Status:</p>
              <p className="font-medium text-sm">
                {statusLabels[currentStatus]}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                New Status:
              </p>
              <p className="font-medium text-sm">{statusLabels[newStatus]}</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUpdating}
            className="gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Icon className="w-4 h-4" />
                Confirm
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

