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
        <span className="text-[15px] tracking-tight">
          AI <span className="font-serif italic font-normal text-gradient-hero">Talent</span> Tracker
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
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-signal text-[hsl(var(--signal-foreground))] shadow-sm ring-1 ring-signal/20 transition-transform duration-200 group-hover:scale-[1.04]",
        className,
      )}
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-[hsl(var(--signal-foreground)/0.25)]" />
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
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <circle cx="5" cy="19" r="1.5" fill="currentColor" />
        <circle cx="11" cy="11" r="1.5" fill="currentColor" />
        <circle cx="15" cy="14" r="1.5" fill="currentColor" />
        <circle cx="19" cy="6" r="2" fill="currentColor" />
      </svg>
    </span>
  );
}
