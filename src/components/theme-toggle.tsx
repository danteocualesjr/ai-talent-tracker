"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      suppressHydrationWarning
      onClick={toggleTheme}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted-foreground shadow-sm transition-all duration-200",
        "hover:border-foreground/15 hover:bg-card hover:text-foreground hover:shadow-[0_0_12px_-2px_hsl(var(--signal)/0.25)] motion-safe:hover:rotate-6",
        isDark && "border-signal/25 bg-signal/5 text-signal",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40",
        "motion-safe:active:scale-95",
        className,
      )}
    >
      {!mounted ? (
        <span className="h-4 w-4 rounded-full bg-muted-foreground/25" aria-hidden />
      ) : (
        <span className="relative block h-4 w-4" aria-hidden>
          <Sun
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300 motion-safe:rotate-0",
              isDark ? "scale-100 opacity-100" : "scale-75 opacity-0 motion-safe:-rotate-90",
            )}
          />
          <Moon
            className={cn(
              "absolute inset-0 h-4 w-4 transition-all duration-300 motion-safe:rotate-0",
              isDark ? "scale-75 opacity-0 motion-safe:rotate-90" : "scale-100 opacity-100",
            )}
          />
        </span>
      )}
    </button>
  );
}
