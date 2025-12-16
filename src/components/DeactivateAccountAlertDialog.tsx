import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeactivateAccountAlertDialogProps {
  onDeactivate: () => void;
}

export function DeactivateAccountAlertDialog({
  onDeactivate,
}: DeactivateAccountAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          Deactivate
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="w-[95vw] max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Deactivate account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your account will be temporarily disabled. You can reactivate it by
            signing in again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="w-full sm:w-auto">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDeactivate}
            className="bg-destructive text-destructive-foreground w-full sm:w-auto"
          >
            Deactivate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

