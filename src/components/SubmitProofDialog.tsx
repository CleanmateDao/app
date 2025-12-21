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
import { Upload, Image, Video, Send } from "lucide-react";

interface SubmitProofDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofMedia: File[];
  onProofUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

export function SubmitProofDialog({
  open,
  onOpenChange,
  proofMedia,
  onProofUpload,
  onSubmit,
}: SubmitProofDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit for Review</DialogTitle>
          <DialogDescription>
            Upload images and videos as proof of the cleanup work to submit for
            review and receive rewards.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center mb-4">
            <input
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={onProofUpload}
              className="hidden"
              id="proof-upload"
            />
            <label htmlFor="proof-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload images/videos
              </p>
            </label>
          </div>
          {proofMedia.length > 0 && (
            <div>
              <Label className="mb-2 block">
                Selected files ({proofMedia.length})
              </Label>
              <div className="space-y-2">
                {proofMedia.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-secondary rounded"
                  >
                    {file.type.startsWith("image") ? (
                      <Image className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Video className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm truncate flex-1">{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            <Send className="w-4 h-4 mr-2" />
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

