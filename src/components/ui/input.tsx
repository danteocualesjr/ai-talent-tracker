import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-border/80 bg-background px-3.5 py-2 text-sm shadow-sm transition-all duration-200",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground/60",
        "hover:border-foreground/20 hover:shadow-[inset_0_1px_2px_hsl(var(--foreground)/0.03)]",
        "focus-visible:border-signal/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_4px_hsl(var(--signal)/0.08),inset_0_1px_2px_hsl(var(--foreground)/0.04)]",
        "aria-[invalid=true]:border-destructive/50 aria-[invalid=true]:ring-destructive/20 aria-[invalid=true]:focus-visible:ring-destructive/30",
        "disabled:cursor-not-allowed disabled:border-border/50 disabled:bg-muted/40 disabled:text-muted-foreground disabled:shadow-none disabled:hover:border-border/50",
        "[&:-webkit-autofill]:[-webkit-text-fill-color:hsl(var(--foreground))] [&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_hsl(var(--background))] [&:-webkit-autofill]:[transition:background-color_9999s_ease-out]",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export { Input };
