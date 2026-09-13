import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("kbd tnum select-none transition-shadow hover:shadow-[0_2px_6px_-2px_hsl(var(--foreground)/0.15)]", className)}>{children}</span>;
}
