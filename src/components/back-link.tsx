import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/90 px-2.5 py-1.5 backdrop-blur-sm text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-signal/30 hover:bg-signal/5 hover:text-foreground hover:shadow-[0_4px_16px_-8px_hsl(var(--signal)/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 group motion-safe:active:scale-95",
        className,
      )}
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-x-0.5" />
      <span className="relative">
        {children}
        <span aria-hidden className="absolute -bottom-px left-0 h-px w-0 bg-signal transition-all duration-200 group-hover:w-full" />
      </span>
    </Link>
  );
}
