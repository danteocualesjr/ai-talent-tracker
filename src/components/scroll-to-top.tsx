"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const pathname = usePathname();
  const onFeed = pathname === "/feed" || pathname.startsWith("/feed/");

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollTop > 400);
      setProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const circumference = 2 * Math.PI * 17;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <button
      type="button"
      aria-label={`Scroll to top (${Math.round(progress)}% read)`}
      title={`Back to top · ${Math.round(progress)}% read`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "group/scroll fixed right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-background/95 text-muted-foreground shadow-lg backdrop-blur-md transition-all duration-300 hover:border-signal/40 hover:bg-signal/10 hover:text-signal hover:shadow-[0_0_24px_-4px_hsl(var(--signal)/0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 motion-safe:active:scale-95",
        onFeed ? "bottom-24 md:bottom-6" : "bottom-[max(1.5rem,env(safe-area-inset-bottom))]",
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/70 bg-background/95 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all duration-200 group-hover/scroll:-translate-y-0.5 group-hover/scroll:opacity-100 group-focus-visible/scroll:opacity-100"
      >
        <span className="tnum">{Math.round(progress)}%</span> read
      </span>
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 -rotate-90"
        viewBox="0 0 44 44"
      >
        <circle
          cx="22"
          cy="22"
          r="17"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="2"
          opacity="0.5"
        />
        <circle
          cx="22"
          cy="22"
          r="17"
          fill="none"
          stroke="hsl(var(--signal))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="motion-safe:transition-[stroke-dashoffset] motion-safe:duration-150"
        />
      </svg>
      <ArrowUp className="relative h-4 w-4" />
    </button>
  );
}
