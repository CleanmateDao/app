import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const AvatarViewerOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
AvatarViewerOverlay.displayName = "AvatarViewerOverlay";

const AvatarViewerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <AvatarViewerOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 flex items-center justify-center translate-x-[-50%] translate-y-[-50%] duration-200 bg-transparent border-none shadow-none p-0 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] focus:outline-none",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full bg-black/50 text-white p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
AvatarViewerContent.displayName = "AvatarViewerContent";

interface AvatarViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeClasses = {
  sm: "w-32 h-32",
  md: "w-48 h-48",
  lg: "w-64 h-64",
  xl: "w-80 h-80",
  "2xl": "w-96 h-96",
};

export function AvatarViewer({
  open,
  onOpenChange,
  src,
  alt = "Avatar",
  size = "lg",
}: AvatarViewerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AvatarViewerContent>
        <img
          src={src}
          alt={alt}
          className={cn(
            "rounded-full object-cover shadow-2xl",
            sizeClasses[size]
          )}
        />
      </AvatarViewerContent>
    </DialogPrimitive.Root>
  );
}

interface AvatarViewerTriggerProps {
  children: React.ReactNode;
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function AvatarViewerTrigger({
  children,
  src,
  alt = "Avatar",
  size = "lg",
}: AvatarViewerTriggerProps) {
  const [open, setOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
      <AvatarViewer
        open={open}
        onOpenChange={setOpen}
        src={src}
        alt={alt}
        size={size}
      />
    </>
  );
}
