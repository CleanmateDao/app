import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantName: string | undefined;
  rating: number;
  onRatingChange: (rating: number) => void;
  onSubmit: () => void;
}

export function RatingDialog({
  open,
  onOpenChange,
  participantName,
  rating,
  onRatingChange,
  onSubmit,
}: RatingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate Participant</DialogTitle>
          <DialogDescription>
            How would you rate {participantName}'s participation?
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={rating === 0}>
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

