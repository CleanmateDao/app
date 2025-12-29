import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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

  const carouselContent = (
    <div className="flex flex-col px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent className="-ml-0">
          {media.map((item, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="flex flex-col items-center justify-center w-full gap-4">
                <div className="w-full flex items-center justify-center">
                  {item.type === "video" ? (
                    <div className="w-full flex items-center justify-center bg-secondary/30 dark:bg-secondary/50 rounded-xl p-3 sm:p-4">
                      <video
                        src={item.url}
                        controls
                        className="max-w-full max-h-[calc(90vh-180px)] w-auto h-auto rounded-lg shadow-md"
                        autoPlay
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center p-3 sm:p-4">
                      <img
                        src={item.url}
                        alt={item.caption || `Image ${index + 1}`}
                        className="max-w-full max-h-[calc(90vh-180px)] w-auto h-auto object-contain rounded-lg shadow-md"
                      />
                    </div>
                  )}
                </div>
                {item.caption && (
                  <div className="w-full text-center px-2 flex-shrink-0 pb-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
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
            <CarouselPrevious className="left-2 sm:left-4 bg-background/80 backdrop-blur-sm hover:bg-background border-2" />
            <CarouselNext className="right-2 sm:right-4 bg-background/80 backdrop-blur-sm hover:bg-background border-2" />
          </>
        )}
      </Carousel>
    </div>
  );

  // Mobile: Use drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[80vh] flex flex-col">
          <DrawerHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b bg-background">
            <DrawerTitle className="text-lg font-semibold">
              {media.length > 1
                ? `Media ${current + 1} of ${media.length}`
                : "Media Viewer"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto flex-1 min-h-0">
            {carouselContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] p-0 gap-0 flex flex-col overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b bg-background">
          <DialogTitle className="text-lg font-semibold">
            {media.length > 1
              ? `Media ${current + 1} of ${media.length}`
              : "Media Viewer"}
          </DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto flex-1 min-h-0 py-2">
          {carouselContent}
        </div>
      </DialogContent>
    </Dialog>
  );
}
