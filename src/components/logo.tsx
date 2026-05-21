import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span
        aria-hidden
        className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-foreground text-background shadow-sm transition-transform duration-200 group-hover:scale-[1.02]"
      >
        <span className="absolute inset-0 bg-gradient-to-br from-signal/30 to-transparent opacity-80" />
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          className="relative h-3.5 w-3.5 shrink-0"
          aria-hidden
        >
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          <path
            d="M6 18 L12 12 L18 6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.45"
          />
        </svg>
      </span>
      <span className="text-[15px]">AI Talent Tracker</span>
    </Link>
  );
}
