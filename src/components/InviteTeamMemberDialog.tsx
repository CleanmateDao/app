import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { UserPlus } from "lucide-react";

interface TeamMemberPermissions {
  canOrganizeCleanups: boolean;
  canManageParticipants: boolean;
  canSubmitProof: boolean;
  canViewRewards: boolean;
  canClaimRewards: boolean;
  canManageTeam: boolean;
}

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  onEmailChange: (email: string) => void;
  permissions: TeamMemberPermissions;
  onPermissionsChange: (permissions: TeamMemberPermissions) => void;
  onSubmit: () => void;
}

export function InviteTeamMemberDialog({
  open,
  onOpenChange,
  email,
  onEmailChange,
  permissions,
  onPermissionsChange,
  onSubmit,
}: InviteTeamMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation and select their permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
            />
          </div>
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
                  checked={permissions.canOrganizeCleanups}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canOrganizeCleanups: checked,
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
                  checked={permissions.canManageParticipants}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canManageParticipants: checked,
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
                  checked={permissions.canSubmitProof}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canSubmitProof: checked,
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
                  checked={permissions.canViewRewards}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canViewRewards: checked,
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
                  checked={permissions.canClaimRewards}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canClaimRewards: checked,
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
                  checked={permissions.canManageTeam}
                  onCheckedChange={(checked) =>
                    onPermissionsChange({
                      ...permissions,
                      canManageTeam: checked,
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
          <Button onClick={onSubmit} className="w-full sm:w-auto">
            Send Invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

