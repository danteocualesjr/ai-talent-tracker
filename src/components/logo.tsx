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
        className="relative inline-flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-background"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
          {/* tight, geometric mark — three dots forming a vector */}
          <circle cx="6" cy="18" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="18" cy="6" r="2" fill="currentColor" />
          <path
            d="M6 18 L12 12 L18 6"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      </span>
      <span className="text-[15px]">
        AI Talent Tracker
      </span>
    </Link>
  );
}
