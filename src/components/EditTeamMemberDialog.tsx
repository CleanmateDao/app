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
import { Check } from "lucide-react";

interface TeamMemberPermissions {
  canOrganizeCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  canViewRewards: boolean;
  canClaimRewards: boolean;
  canManageTeam: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  permissions: TeamMemberPermissions;
  avatar?: string;
}

interface EditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: TeamMember | null;
  onMemberChange: (member: TeamMember | null) => void;
  onSave: () => void;
}

export function EditTeamMemberDialog({
  open,
  onOpenChange,
  member,
  onMemberChange,
  onSave,
}: EditTeamMemberDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update permissions for {member.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Organize Cleanups</p>
                  <p className="text-xs text-muted-foreground">
                    Can create and manage cleanup events
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canOrganizeCleanups ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canOrganizeCleanups: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manage Participants</p>
                  <p className="text-xs text-muted-foreground">
                    Can accept or reject participant applications
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canManageParticipants ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canManageParticipants: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Submit Proof of Work</p>
                  <p className="text-xs text-muted-foreground">
                    Can submit cleanup evidence
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canSubmitProof ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canSubmitProof: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">View Rewards</p>
                  <p className="text-xs text-muted-foreground">
                    Can see reward information
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canViewRewards ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canViewRewards: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Claim Rewards</p>
                  <p className="text-xs text-muted-foreground">
                    Can claim rewards to wallet or bank
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canClaimRewards ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canClaimRewards: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Manage Team</p>
                  <p className="text-xs text-muted-foreground">
                    Can invite and remove team members
                  </p>
                </div>
                <Switch
                  checked={member.permissions.canManageTeam ?? false}
                  onCheckedChange={(checked) =>
                    onMemberChange({
                      ...member,
                      permissions: {
                        ...member.permissions,
                        canManageTeam: checked,
                      },
                    })
                  }
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
          >
            Cancel
          </Button>
          <Button onClick={onSave} className="w-full sm:w-auto">
            <Check className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

