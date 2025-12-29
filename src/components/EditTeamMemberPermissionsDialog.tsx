import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save } from "lucide-react";
import type { SubgraphTeamMembership } from "@/services/subgraph/types";

interface EditTeamMemberPermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: SubgraphTeamMembership | null;
  onSubmit: (params: {
    member: string;
    canEditCleanups: boolean;
    canManageParticipants: boolean;
    canSubmitProof: boolean;
  }) => void;
  isPending: boolean;
}

export function EditTeamMemberPermissionsDialog({
  open,
  onOpenChange,
  teamMember,
  onSubmit,
  isPending,
}: EditTeamMemberPermissionsDialogProps) {
  if (!teamMember) return null;

  const [canEditCleanups, setCanEditCleanups] = useState(
    teamMember.canEditCleanups
  );
  const [canManageParticipants, setCanManageParticipants] = useState(
    teamMember.canManageParticipants
  );
  const [canSubmitProof, setCanSubmitProof] = useState(
    teamMember.canSubmitProof
  );

  // Update local state when teamMember changes
  useEffect(() => {
    if (teamMember) {
      setCanEditCleanups(teamMember.canEditCleanups);
      setCanManageParticipants(teamMember.canManageParticipants);
      setCanSubmitProof(teamMember.canSubmitProof);
    }
  }, [teamMember]);

  const handleSubmit = () => {
    onSubmit({
      member: teamMember.member,
      canEditCleanups,
      canManageParticipants,
      canSubmitProof,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member Permissions</DialogTitle>
          <DialogDescription>
            Update permissions for this team member.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Member Address</Label>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {teamMember.member}
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
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

