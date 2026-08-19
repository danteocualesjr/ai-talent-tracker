import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
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
          "border-signal/25 bg-signal/10 text-signal shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.12)] dark:border-signal/30 dark:bg-signal/15",
        warning:
          "border-[hsl(var(--accent-amber)/0.35)] bg-[hsl(var(--accent-amber)/0.1)] text-[hsl(var(--accent-amber))] shadow-[inset_0_1px_0_0_hsl(var(--accent-amber)/0.12)] dark:border-[hsl(var(--accent-amber)/0.3)] dark:bg-[hsl(var(--accent-amber)/0.12)]",
        info:
          "border-signal/20 bg-signal/8 text-signal shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.1)] dark:border-signal/25 dark:bg-signal/12",
        purple:
          "border-[hsl(var(--accent-violet)/0.35)] bg-[hsl(var(--accent-violet)/0.1)] text-violet-accent shadow-[inset_0_1px_0_0_hsl(var(--accent-violet)/0.12)] dark:border-[hsl(var(--accent-violet)/0.3)] dark:bg-[hsl(var(--accent-violet)/0.12)]",
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
