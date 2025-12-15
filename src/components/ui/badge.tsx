import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
        draft: "bg-status-draft/15 text-status-draft border border-status-draft/20",
        submitted: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        in_review: "bg-status-pending/15 text-status-pending border border-status-pending/30",
        published: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20",
        voting: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20",
        approved: "bg-status-approved/15 text-status-approved border border-status-approved/20",
        disapproved: "bg-status-rejected/15 text-status-rejected border border-status-rejected/20",
        rejected: "bg-status-rejected/15 text-status-rejected border border-status-rejected/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
