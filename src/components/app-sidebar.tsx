"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ArrowUpRight,
  Bell,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Search,
  Settings,
  Sparkles,
  Activity,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppCommandMenu } from "@/components/app-command-menu";
import { cn } from "@/lib/utils";

const NAV_SECTIONS: { label: string; items: { href: string; icon: typeof LayoutDashboard; label: string }[] }[] = [
  {
    label: "Tracking",
    items: [
      { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/app/watchlist", icon: ListChecks, label: "Watchlist" },
      { href: "/app/events", icon: Activity, label: "Events" },
      { href: "/app/labs", icon: Building2, label: "Lab rosters" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { href: "/app/alerts", icon: Bell, label: "Alerts" },
      { href: "/app/billing", icon: CreditCard, label: "Billing" },
      { href: "/app/settings", icon: Settings, label: "Settings" },
    ],
  },
];

interface Props {
  orgName: string;
  orgPlan: string;
  email: string;
}

export function AppSidebar({ orgName, orgPlan, email }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const isFree = orgPlan === "free";

  return (
    <>
      <AppCommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl md:hidden">
        <Logo href="/app" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setCommandOpen(true);
              setOpen(false);
            }}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:hidden"
            aria-label="Open search and navigation"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-border/50 app-sidebar-bg backdrop-blur-2xl motion-safe:transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="pointer-events-none absolute inset-0 noise opacity-40" aria-hidden />
        <div className="relative flex h-[60px] items-center justify-between border-b border-border/60 px-4">
          <Logo href="/app" />
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:hidden"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace card */}
        <div className="relative px-3 py-4">
          <div className="group/workspace surface-card flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 hover:border-signal/25 hover:shadow-[0_10px_28px_-18px_hsl(var(--signal)/0.45)] motion-safe:hover:-translate-y-0.5">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-foreground to-foreground/80 text-[11px] font-bold text-background ring-2 ring-signal/20 motion-safe:transition-transform motion-safe:group-hover/workspace:scale-105">
              {orgName.slice(0, 2).toUpperCase()}
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-card bg-signal signal-pulse" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold leading-tight">{orgName}</div>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] capitalize">
                  {orgPlan}
                </Badge>
                <span className="text-[10px] text-muted-foreground">workspace</span>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="App" className="relative flex-1 space-y-5 overflow-y-auto px-3 pb-4 text-sm">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="space-y-0.5">
              <div className="label-caps px-2 pb-1.5 text-[10px]">{section.label}</div>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-all duration-150",
                      active
                        ? "nav-active-rail bg-signal/10 pl-3.5 font-semibold text-foreground shadow-[inset_0_1px_0_0_hsl(var(--signal)/0.08)]"
                        : "text-muted-foreground hover:bg-accent/60 hover:pl-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-signal" : "text-muted-foreground/80 group-hover:text-foreground",
                      )}
                    />
                    {active && (
                      <span className="relative flex h-1.5 w-1.5 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                      </span>
                    )}
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Upgrade card */}
        {isFree ? (
          <div className="relative px-3 pb-3">
            <div className="relative overflow-hidden rounded-xl border border-signal/20 bg-gradient-to-br from-card via-card to-signal/[0.1] p-4 shadow-[0_12px_32px_-20px_hsl(var(--signal)/0.45)] transition-shadow hover:border-signal/35 hover:shadow-[0_16px_40px_-18px_hsl(var(--signal)/0.55)]">
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-signal/15 blur-2xl" />
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-signal/10 text-signal">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-semibold tracking-tight">Upgrade to Pro</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                Real-time alerts, 100 profiles, and Slack delivery.
              </p>
              <Button asChild size="sm" variant="signal" className="mt-3 h-7 w-full text-[11px]">
                <Link href="/app/billing">
                  See plans <ArrowUpRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="px-3 pb-3">
            <Link
              href="/feed"
              className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              <span className="flex-1">Public feed</span>
              <ArrowUpRight className="h-3 w-3 opacity-50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
            </Link>
          </div>
        )}

        {/* Account footer — mobile only; desktop uses the topbar's user menu */}
        <div className="relative border-t border-border/60 px-3 py-3 md:hidden">
          <div className="flex items-center gap-2.5 px-1">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
              {email.slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-muted-foreground">{email}</span>
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              aria-label="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function signOut() {
  const form = document.createElement("form");
  form.action = "/auth/signout";
  form.method = "post";
  document.body.appendChild(form);
  form.submit();
}
