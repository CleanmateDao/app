import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarViewerTrigger } from "@/components/ui/avatar-viewer";
import { Mail, Calendar, ShieldCheck, User, MapPin } from "lucide-react";
import type { CleanupParticipant } from "@/types/cleanup";
import { maskSensitiveInfo } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ParticipantInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: CleanupParticipant | null;
}

export function ParticipantInfoDialog({
  open,
  onOpenChange,
  participant,
}: ParticipantInfoDialogProps) {
  const isMobile = useIsMobile();

  if (!participant) return null;

  const content = (
    <>
      <div className="space-y-6 py-4">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4">
          {participant.avatar ? (
            <AvatarViewerTrigger
              src={participant.avatar}
              alt={participant.name}
              size="xl"
            >
              <Avatar className="w-16 h-16">
                <AvatarImage src={participant.avatar} alt={participant.name} />
                <AvatarFallback className="text-xl">
                  {participant.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </AvatarViewerTrigger>
          ) : (
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">
                {participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
          <div>
            <h3 className="text-lg font-semibold">
              {maskSensitiveInfo(participant.name)}
            </h3>
            <div className="flex items-center flex-wrap gap-2 mt-1">
              <Badge
                variant={
                  participant.status === "accepted"
                    ? "default"
                    : participant.status === "pending"
                    ? "secondary"
                    : "destructive"
                }
              >
                {participant.status.charAt(0).toUpperCase() +
                  participant.status.slice(1)}
              </Badge>
              {participant.isOrganizer && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <User className="w-3 h-3 mr-1" />
                  Organizer
                </Badge>
              )}
              {participant.isKyced && (
                <Badge
                  variant="secondary"
                  className="bg-status-approved/10 text-status-approved border-status-approved/20"
                >
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  KYC
                </Badge>
              )}
              {participant.emailVerified && (
                <Badge
                  variant="secondary"
                  className="bg-status-approved/10 text-status-approved border-status-approved/20"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  Email Verified
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  {maskSensitiveInfo(participant.email)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Applied On</p>
              <p className="text-sm font-medium">{participant.appliedAt}</p>
            </div>
          </div>
          {participant.country && (
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="text-sm font-medium">
                  {[participant.state, participant.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // Mobile: Use drawer (full width)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="w-full">
          <DrawerHeader>
            <DrawerTitle>Participant Details</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 overflow-y-auto">{content}</div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md sm:w-[90%]">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
        </DialogHeader>
        {content}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
