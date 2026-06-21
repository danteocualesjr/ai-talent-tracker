import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export function BackLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card/50 px-2.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm transition-all hover:border-foreground/15 hover:bg-accent/80 hover:text-foreground hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40 group",
        className,
      )}
    >
      <ArrowLeft aria-hidden="true" className="h-4 w-4 transition-transform motion-safe:group-hover:-translate-x-0.5" />
      <span className="relative">
        {children}
        <span className="absolute -bottom-px left-0 h-px w-0 bg-signal transition-all duration-200 group-hover:w-full" />
      </span>
    </Link>
  );
}
