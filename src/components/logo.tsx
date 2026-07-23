import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/", showWordmark = true }: { className?: string; href?: string; showWordmark?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
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
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-foreground via-foreground to-foreground/85 text-background shadow-[0_8px_24px_-8px_hsl(var(--foreground)/0.5)] ring-2 ring-signal/25 transition-transform duration-200 group-hover:scale-[1.05]",
        className,
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-br from-signal/45 via-transparent to-transparent opacity-95" />
      <span
        aria-hidden
        className="absolute -bottom-3 -right-3 h-8 w-8 rounded-full bg-signal/50 blur-md transition-opacity duration-300 group-hover:opacity-100"
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
