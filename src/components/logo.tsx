import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", showWordmark = true }: { className?: string; href?: string; showWordmark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        className,
      )}
    >
      <LogoMark />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight">
          AI Talent Tracker
        </span>
      )}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex h-7 w-7 shrink-0 rounded-[5px] bg-signal transition-transform duration-200 group-hover:scale-[1.04]",
        className,
      )}
    />
  );
}
