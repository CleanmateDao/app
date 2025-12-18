import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Calendar, Star } from "lucide-react";
import type { CleanupParticipant } from "@/types/cleanup";

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
  if (!participant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[90%]">
        <DialogHeader>
          <DialogTitle>Participant Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="text-xl">
                {participant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{participant.name}</h3>
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
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{participant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Applied On</p>
                <p className="text-sm font-medium">{participant.appliedAt}</p>
              </div>
            </div>
            {participant.rating && (
              <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <Star className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < participant.rating!
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                    <span className="text-sm ml-2">
                      {participant.rating}/5
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

