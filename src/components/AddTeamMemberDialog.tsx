import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, UserPlus } from "lucide-react";
import { useState } from "react";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (params: {
    member: string;
    canEditCleanups: boolean;
    canManageParticipants: boolean;
    canSubmitProof: boolean;
  }) => void;
  isPending: boolean;
}

export function AddTeamMemberDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
}: AddTeamMemberDialogProps) {
  const [memberAddress, setMemberAddress] = useState("");
  const [canEditCleanups, setCanEditCleanups] = useState(false);
  const [canManageParticipants, setCanManageParticipants] = useState(false);
  const [canSubmitProof, setCanSubmitProof] = useState(false);

  const handleSubmit = () => {
    if (!memberAddress.trim()) {
      return;
    }
    onSubmit({
      member: memberAddress.trim(),
      canEditCleanups,
      canManageParticipants,
      canSubmitProof,
    });
    // Reset form
    setMemberAddress("");
    setCanEditCleanups(false);
    setCanManageParticipants(false);
    setCanSubmitProof(false);
  };

  const handleClose = (open: boolean) => {
    if (!open && !isPending) {
      // Reset form when closing
      setMemberAddress("");
      setCanEditCleanups(false);
      setCanManageParticipants(false);
      setCanSubmitProof(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Add a team member by their wallet address and set their permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="memberAddress">Wallet Address *</Label>
            <Input
              id="memberAddress"
              placeholder="0x..."
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
              disabled={isPending}
            />
            <p className="text-xs text-muted-foreground">
              Enter the wallet address of the team member to add
            </p>
          </div>
          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Edit Cleanups</p>
                  <p className="text-xs text-muted-foreground">
                    Can edit cleanup details and status
                  </p>
                </div>
                <Switch
                  checked={canEditCleanups}
                  onCheckedChange={setCanEditCleanups}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Manage Participants</p>
                  <p className="text-xs text-muted-foreground">
                    Can accept or reject participant applications
                  </p>
                </div>
                <Switch
                  checked={canManageParticipants}
                  onCheckedChange={setCanManageParticipants}
                  disabled={isPending}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium">Submit Proof</p>
                  <p className="text-xs text-muted-foreground">
                    Can submit proof of work for cleanups
                  </p>
                </div>
                <Switch
                  checked={canSubmitProof}
                  onCheckedChange={setCanSubmitProof}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={isPending || !memberAddress.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

