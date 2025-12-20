import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

export interface MediaItem {
  url: string;
  type: "image" | "video";
  caption?: string;
}

interface MediaViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  initialIndex?: number;
}

export function MediaViewerDialog({
  open,
  onOpenChange,
  media,
  initialIndex = 0,
}: MediaViewerDialogProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (api && open && initialIndex >= 0 && initialIndex < media.length) {
      api.scrollTo(initialIndex);
    }
  }, [api, open, initialIndex, media.length]);

  if (media.length === 0) {
    return null;
  }

  const currentMedia = media[current];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] p-0 gap-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle className="text-lg">
            {media.length > 1
              ? `Media ${current + 1} of ${media.length}`
              : "Media Viewer"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6 min-h-0">
          <Carousel
            setApi={setApi}
            className="w-full flex-1 min-h-0"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="h-full -ml-0">
              {media.map((item, index) => (
                <CarouselItem key={index} className="pl-0 h-full">
                  <div className="flex flex-col items-center justify-center h-full w-full gap-4">
                    <div className="flex-1 w-full flex items-center justify-center overflow-hidden min-h-0">
                      {item.type === "video" ? (
                        <div className="w-full h-full flex items-center justify-center bg-secondary rounded-lg p-4">
                          <video
                            src={item.url}
                            controls
                            className="max-w-full max-h-full rounded-lg"
                            autoPlay
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center overflow-hidden p-4">
                          <img
                            src={item.url}
                            alt={item.caption || `Image ${index + 1}`}
                            className="max-w-full max-h-full object-contain rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                    {item.caption && (
                      <div className="w-full text-center px-4 flex-shrink-0">
                        <p className="text-sm text-muted-foreground">
                          {item.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {media.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </div>
      </DialogContent>
    </Dialog>
  );
}

