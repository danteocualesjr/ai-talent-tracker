"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, Building2, CreditCard, LayoutDashboard, ListChecks, LogOut, Menu, Settings, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/watchlist", icon: ListChecks, label: "Watchlist" },
  { href: "/app/events", icon: Users, label: "Events" },
  { href: "/app/labs", icon: Building2, label: "Lab rosters" },
  { href: "/app/alerts", icon: Bell, label: "Alerts" },
  { href: "/app/billing", icon: CreditCard, label: "Billing" },
  { href: "/app/settings", icon: Settings, label: "Settings" },
];

interface Props {
  orgName: string;
  orgPlan: string;
  email: string;
}

export function AppSidebar({ orgName, orgPlan, email }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
        <Logo href="/app" />
        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 hover:bg-accent"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Drawer overlay (mobile) */}
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r bg-card transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-5">
          <Logo href="/app" />
          <button onClick={() => setOpen(false)} className="rounded-md p-1 hover:bg-accent md:hidden" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-3 py-4">
          <div className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Workspace</div>
          <div className="flex items-center justify-between rounded-lg border bg-background px-3 py-2 text-sm">
            <span className="truncate font-medium">{orgName}</span>
            <Badge variant="secondary" className="capitalize">{orgPlan}</Badge>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 text-sm">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-md px-3 py-2 transition-colors",
                  active
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                )}
              >
                {active && <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-foreground" />}
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <div className="truncate px-2 pb-2 text-xs text-muted-foreground" title={email}>
            {email}
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
