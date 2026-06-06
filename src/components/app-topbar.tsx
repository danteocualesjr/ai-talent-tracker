"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface Props {
  email: string;
  orgPlan: string;
  unreadCount?: number;
}

const SEGMENT_LABELS: Record<string, string> = {
  app: "Workspace",
  watchlist: "Watchlist",
  events: "Events",
  labs: "Lab rosters",
  alerts: "Alerts",
  billing: "Billing",
  settings: "Settings",
  profiles: "Profile",
};

/**
 * Topbar for the authenticated app shell.
 *
 * Shows a breadcrumb (from the URL), a Cmd+K search trigger,
 * a notifications bell, and a user dropdown that replaces the
 * old "email + sign out" footer in the sidebar.
 */
export function AppTopbar({ email, orgPlan, unreadCount = 0 }: Props) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // Cmd+K placeholder behavior: focuses the trigger so users
  // get visual feedback even before a palette is wired up.
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPressed(true);
        setTimeout(() => setPressed(false), 400);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const initials = email
    .split("@")[0]
    .split(/[.\-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "U";

  return (
    <div className="sticky top-0 z-20 hidden h-[60px] items-center gap-3 border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl md:flex">
      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
        <Link
          href="/app"
          className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          <LayoutDashboard aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Dashboard</span>
        </Link>
        {segments.slice(1).map((seg, i) => {
          const href = "/" + segments.slice(0, i + 2).join("/");
          const last = i === segments.length - 2;
          const label = SEGMENT_LABELS[seg] ?? prettify(seg);
          return (
            <span key={href} className="flex min-w-0 items-center gap-1.5">
              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />
              {last ? (
                <span className="truncate font-semibold text-foreground" aria-current="page">{label}</span>
              ) : (
                <Link
                  href={href}
                  className="truncate rounded-md px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          className={cn(
            "group inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/60 px-3 text-xs text-muted-foreground shadow-sm transition-all duration-200",
            "hover:border-foreground/15 hover:bg-card hover:text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
            pressed && "ring-2 ring-signal/40",
          )}
          aria-keyshortcuts="Meta+K"
          aria-label="Search"
        >
          <Search aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Search…</span>
          <span className="ml-1 hidden items-center gap-0.5 lg:inline-flex">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>

        <ThemeToggle />

        <button
          type="button"
          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted-foreground shadow-sm transition-colors hover:border-foreground/15 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <Bell aria-hidden="true" className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 text-[9px] font-bold text-[hsl(var(--signal-foreground))]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="ml-1 inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/60 pl-1.5 pr-2.5 text-sm shadow-sm transition-colors hover:border-foreground/15 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[10px] font-bold text-background">
                {initials}
              </span>
              <span className="hidden max-w-[140px] truncate text-xs font-medium text-muted-foreground lg:inline">
                {email}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <div className="flex items-center gap-3 px-2 py-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-[11px] font-bold text-background">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{email}</div>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Badge variant="secondary" className="capitalize">
                    {orgPlan}
                  </Badge>
                  {orgPlan === "free" && (
                    <Link href="/app/billing" className="text-[10px] font-semibold text-signal hover:underline">
                      Upgrade
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Profile
                <span className="ml-auto text-[10px] tracking-widest text-muted-foreground">⌘,</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Billing
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/app/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/feed" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> What&apos;s new
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="mailto:hello@aitalenttracker.com" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Get help
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onSelect={() => signOut()}>
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function prettify(seg: string) {
  return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
}

function signOut() {
  const form = document.createElement("form");
  form.action = "/auth/signout";
  form.method = "post";
  document.body.appendChild(form);
  form.submit();
}
