import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", showWordmark = true }: { className?: string; href?: string; showWordmark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <LogoMark />
      {showWordmark && <span className="text-[15px]">AI Talent Tracker</span>}
    </Link>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground text-background shadow-sm transition-transform duration-200 group-hover:scale-[1.03]",
        className,
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-signal/35 via-transparent to-transparent opacity-90" />
      <span
        aria-hidden
        className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full bg-signal/40 blur-md transition-opacity duration-300 group-hover:opacity-90"
      />
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        className="relative h-3.5 w-3.5 shrink-0"
        aria-hidden
      >
        <path
          d="M5 19 L11 11 L15 14 L19 6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
        />
        <circle cx="5" cy="19" r="1.6" fill="currentColor" />
        <circle cx="11" cy="11" r="1.6" fill="currentColor" />
        <circle cx="15" cy="14" r="1.6" fill="currentColor" />
        <circle cx="19" cy="6" r="2" fill="currentColor" />
        <circle cx="19" cy="6" r="3.5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.75" />
      </svg>
    </span>
  );
}
