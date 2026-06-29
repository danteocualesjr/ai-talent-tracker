"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid gap-2 px-5 py-4 sm:grid-cols-3">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm transition-all duration-200",
              active
                ? "border-signal/40 bg-signal/5 font-medium text-foreground shadow-sm ring-1 ring-signal/20 motion-safe:scale-[1.02]"
                : "border-border/60 text-muted-foreground hover:border-foreground/15 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-signal text-[9px] font-bold text-[hsl(var(--signal-foreground))] transition-all",
                active ? "scale-100 opacity-100" : "scale-75 opacity-0",
              )}
            >
              ✓
            </span>
            <Icon className={cn("h-5 w-5 transition-transform duration-200 motion-safe:group-hover:scale-110", active && "text-signal")} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
