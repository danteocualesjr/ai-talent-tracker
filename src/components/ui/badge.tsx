import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-foreground text-background",
        secondary:
          "border-border/70 bg-secondary text-secondary-foreground",
        outline:
          "border-border/70 bg-transparent text-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success:
          "border-emerald-200/60 bg-emerald-50 text-emerald-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300",
        warning:
          "border-amber-200/60 bg-amber-50 text-amber-900 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300",
        info:
          "border-blue-200/60 bg-blue-50 text-blue-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300",
        purple:
          "border-violet-200/60 bg-violet-50 text-violet-800 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)] dark:border-violet-900/40 dark:bg-violet-950/40 dark:text-violet-300",
        gradient:
          "border-transparent bg-foreground text-background",
        glow:
          "border-border/70 bg-background text-foreground shadow-[0_0_0_3px_hsl(var(--signal)/0.08)]",
        signal:
          "border-transparent bg-signal/12 text-signal shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.15)] dark:bg-signal/15",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
