import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="relative flex h-6 w-6 items-center justify-center">
        <span className="absolute inset-0 rounded-md bg-gradient-to-br from-foreground to-foreground/60" />
        <svg viewBox="0 0 24 24" fill="none" className="relative z-10 h-3.5 w-3.5 text-background">
          <path d="M12 2v3M12 19v3M22 12h-3M5 12H2M19.07 4.93l-2.12 2.12M7.05 16.95l-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 7.05L4.93 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="currentColor" />
        </svg>
      </span>
      <span>AI Talent Tracker</span>
    </Link>
  );
}
