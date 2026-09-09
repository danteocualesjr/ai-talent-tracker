import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[100px] w-full rounded-md border border-border/80 bg-background px-3.5 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60",
      "hover:border-foreground/20 hover:shadow-[inset_0_1px_2px_hsl(var(--foreground)/0.03)]",
      "focus-visible:border-signal/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_4px_hsl(var(--signal)/0.08),inset_0_1px_2px_hsl(var(--foreground)/0.04)]",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
