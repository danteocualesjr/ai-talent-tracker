"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

type CommandItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  group: string;
};

const COMMANDS: CommandItem[] = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard, group: "Navigate" },
  { href: "/app/watchlist", label: "Watchlist", icon: ListChecks, keywords: ["profiles", "tracked"], group: "Navigate" },
  { href: "/app/events", label: "Events", icon: Users, keywords: ["activity", "inbox", "changes"], group: "Navigate" },
  { href: "/app/labs", label: "Lab rosters", icon: Building2, keywords: ["labs", "openai", "anthropic"], group: "Navigate" },
  { href: "/app/alerts", label: "Alerts", icon: Bell, keywords: ["slack", "email", "webhook"], group: "Navigate" },
  { href: "/app/billing", label: "Billing", icon: CreditCard, keywords: ["plan", "upgrade", "subscription"], group: "Navigate" },
  { href: "/app/settings", label: "Settings", icon: Settings, keywords: ["account", "workspace"], group: "Navigate" },
  { href: "/app/watchlist#add-profile", label: "Add profile", icon: Plus, keywords: ["new", "track", "linkedin"], group: "Actions" },
];

type AppCommandMenuProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AppCommandMenu({ open, onOpenChange }: AppCommandMenuProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.keywords?.some((keyword) => keyword.includes(q)),
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const active = listRef.current?.querySelector("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, filtered]);

  const run = useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href);
    },
    [onOpenChange, router],
  );

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      run(filtered[activeIndex].href);
    }
  }

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, [filtered]);

  let itemIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12%] max-w-lg translate-y-0 gap-0 overflow-hidden p-0 sm:rounded-2xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <DialogTitle className="sr-only">Jump to page</DialogTitle>
        <div className="border-b border-border/60 px-4 py-3">
          <Input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Jump to a page or action…"
            className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-controls="command-list"
            aria-activedescendant={filtered[activeIndex] ? `command-item-${activeIndex}` : undefined}
          />
        </div>

        <div
          id="command-list"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-[min(320px,50vh)] overflow-y-auto p-2"
        >
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matches found.</p>
          ) : (
            groups.map(([group, items]) => (
              <div key={group} className="pb-1">
                <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {group}
                </div>
                {items.map((item) => {
                  itemIndex += 1;
                  const index = itemIndex;
                  const Icon = item.icon;
                  const active = index === activeIndex;

                  return (
                    <button
                      key={`${item.href}-${item.label}`}
                      id={`command-item-${index}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      data-active={active ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => run(item.href)}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-70" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border/60 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd>
            open
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>esc</Kbd>
            close
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useCommandMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? event.metaKey : event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}
