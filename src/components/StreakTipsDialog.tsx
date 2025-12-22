import { motion } from "framer-motion";
import { Lightbulb, X } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  STREAK_CATEGORIES,
  type StreakCategory,
} from "@/constants/streak-categories";
import waste1 from "@/assets/waste/1.png";
import waste2 from "@/assets/waste/2.png";
import waste3 from "@/assets/waste/3.png";
import waste4 from "@/assets/waste/4.png";
import recycling1 from "@/assets/recycling/1.png";
import recycling2 from "@/assets/recycling/2.png";
import upcycling1 from "@/assets/upcycling/1.png";
import upcycling2 from "@/assets/upcycling/2.png";
import treePlanting1 from "@/assets/tree-planting/1.png";
import treePlanting2 from "@/assets/tree-planting/2.png";
import conservation1 from "@/assets/conservation/1.png";
import conservation2 from "@/assets/conservation/2.png";
import ecoFriendly1 from "@/assets/eco-friendly/1.png";
import ecoFriendly2 from "@/assets/eco-friendly/2.png";

interface StreakTipsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: StreakCategory;
}

// Tips data for each category
const STREAK_TIPS: Record<
  StreakCategory,
  { images: string[]; tips: string[] }
> = {
  Waste: {
    images: [waste1, waste2, waste3, waste4],
    tips: [
      "Capture yourself actively collecting waste - show the items being picked up",
      "Display the collected waste clearly before disposing it properly",
      "Keep it brief (2-5 seconds) with good lighting to show your cleanup action",
    ],
  },
  Recycling: {
    images: [recycling1, recycling2],
    tips: [
      "Show yourself placing clean, sorted materials into the correct recycling bin",
      "Display the recyclable items clearly - paper, plastic, glass, or metal",
      "Demonstrate proper sorting by showing materials going into their specific containers",
    ],
  },
  Upcycling: {
    images: [upcycling1, upcycling2],
    tips: [
      "Show both the original item and your transformed creation side-by-side",
      "Capture yourself actively working on the upcycling transformation",
      "Display the finished upcycled product clearly to show the creative result",
    ],
  },
  "Tree Planting": {
    images: [treePlanting1, treePlanting2],
    tips: [
      "Capture yourself placing the tree or sapling into the ground",
      "Show the tree being planted and the surrounding area clearly",
      "Display the planted tree at the end to demonstrate the completed action",
    ],
  },
  Conservation: {
    images: [conservation1, conservation2],
    tips: [
      "Show yourself actively protecting or preserving nature - water conservation, habitat protection, or wildlife care",
      "Display the conservation action clearly, like repairing ecosystems or protecting natural resources",
      "Capture the impact of your conservation effort - show what you're preserving or protecting",
    ],
  },
  "Eco Friendly": {
    images: [ecoFriendly1, ecoFriendly2],
    tips: [
      "Show yourself using reusable alternatives - bags, bottles, containers, or sustainable products",
      "Demonstrate energy-saving actions - turning off lights, using public transport, or walking/cycling",
      "Display sustainable choices - composting, water conservation, or choosing eco-friendly options",
    ],
  },
};

export function StreakTipsDialog({
  open,
  onOpenChange,
  category,
}: StreakTipsDialogProps) {
  const isMobile = useIsMobile();
  const tipsData = STREAK_TIPS[category] || STREAK_TIPS.Waste;

  const carouselContent = (
    <div className="space-y-6">
      {/* Horizontal Images Carousel */}
      {tipsData.images.length > 0 && (
        <div className="w-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {tipsData.images.map((image, index) => (
                <CarouselItem
                  key={index}
                  className="pl-2 md:pl-4 basis-[71.43%]"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border bg-muted">
                    <img
                      src={image}
                      alt={`${category} tip example ${index + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {tipsData.images.length > 1 && (
              <>
                <CarouselPrevious className="left-2 md:left-4" />
                <CarouselNext className="right-2 md:right-4" />
              </>
            )}
          </Carousel>
        </div>
      )}

      {/* Tips List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Tips for {category}
        </h3>
        <ul className="space-y-2">
          {tipsData.tips.map((tip, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center mt-0.5">
                {index + 1}
              </span>
              <span className="text-sm text-foreground leading-relaxed flex-1">
                {tip}
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Mobile: Use drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <Lightbulb className="h-6 w-6 text-primary" />
              </motion.div>
              <DrawerTitle className="text-xl font-bold">
                {category} Tips
              </DrawerTitle>
            </div>
            <DrawerDescription className="text-sm text-muted-foreground">
              Helpful tips for submitting your {category.toLowerCase()} streak
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-4 pb-4 space-y-4 overflow-y-auto">
            {carouselContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              <Lightbulb className="h-6 w-6 text-primary" />
            </motion.div>
            <DialogTitle className="text-xl font-bold">
              {category} Tips
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            Helpful tips for submitting your {category.toLowerCase()} streak
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">{carouselContent}</div>
      </DialogContent>
    </Dialog>
  );
}
