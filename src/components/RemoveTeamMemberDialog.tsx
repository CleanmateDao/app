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
import { Loader2 } from "lucide-react";

interface RemoveTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberAddress: string;
  onConfirm: () => void;
  isPending: boolean;
}

export function RemoveTeamMemberDialog({
  open,
  onOpenChange,
  memberAddress,
  onConfirm,
  isPending,
}: RemoveTeamMemberDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90%] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this team member? They will lose
            access to all team resources and permissions.
            <br />
            <br />
            <span className="font-mono text-xs break-all">
              {memberAddress}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

