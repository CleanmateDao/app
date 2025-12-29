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
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarViewerTrigger } from "@/components/ui/avatar-viewer";
import { Calendar, MapPin, Users, Send, Loader2 } from "lucide-react";
import type { Cleanup } from "@/types/cleanup";
import type { UserProfile } from "@/types/user";
import fred from "@/assets/fred.png";

interface JoinRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cleanup: Cleanup | null;
  acceptedParticipantsCount: number;
  message: string;
  onMessageChange: (message: string) => void;
  currentUserProfile: UserProfile | null;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function JoinRequestDialog({
  open,
  onOpenChange,
  cleanup,
  acceptedParticipantsCount,
  message,
  onMessageChange,
  currentUserProfile,
  onSubmit,
  isSubmitting,
}: JoinRequestDialogProps) {
  if (!cleanup) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:w-[90%]">
        <DialogHeader>
            <div className="flex flex-col items-center gap-3 mb-4">
              <img src={fred} className="w-14 h-14" />
            <div className="text-center space-y-1">
              <DialogTitle>Request to Join</DialogTitle>
              <DialogDescription>
                Submit your request to participate in "{cleanup.title}". The
                organizer will review and approve your request.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Cleanup Summary */}
          <div className="p-4 bg-secondary rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span>
                {cleanup.date} • {cleanup.startTime} - {cleanup.endTime}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex flex-col">
                {cleanup.location.address && (
                  <span className="font-medium mb-0.5">
                    {cleanup.location.address}
                  </span>
                )}
                <span className="text-muted-foreground">
                  {[cleanup.location.city, cleanup.location.country]
                    .filter(Boolean)
                    .join(", ") || "Location not specified"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>
                {acceptedParticipantsCount}/{cleanup.maxParticipants}{" "}
                participants
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="join-message">
              Message to Organizer (optional)
            </Label>
            <Textarea
              id="join-message"
              placeholder="Introduce yourself or share why you'd like to join this cleanup..."
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* User Info Preview */}
          <div className="p-3 border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">
              Your application will include:
            </p>
            <div className="flex items-center gap-3">
              {currentUserProfile?.profileImage ? (
                <AvatarViewerTrigger
                  src={currentUserProfile.profileImage}
                  alt={currentUserProfile?.name || "User"}
                  size="md"
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={currentUserProfile.profileImage}
                      alt={currentUserProfile?.name || "User"}
                    />
                    <AvatarFallback>
                      {(currentUserProfile?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </AvatarViewerTrigger>
              ) : (
                <Avatar className="w-10 h-10">
                  <AvatarFallback>
                    {(currentUserProfile?.name || "U").charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="font-medium text-sm">
                  {currentUserProfile?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUserProfile?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onMessageChange("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
