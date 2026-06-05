"use client";

import { useEffect, useState } from "react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="grid gap-2 px-5 py-4 sm:grid-cols-3" aria-hidden />;
  }

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
              "flex flex-col items-center gap-2 rounded-xl border px-4 py-4 text-sm transition-colors",
              active
                ? "border-foreground/20 bg-accent font-medium text-foreground shadow-sm"
                : "border-border/60 text-muted-foreground hover:border-foreground/15 hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
