"use client";

import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  app: "Dashboard",
  watchlist: "Watchlist",
  events: "Events",
  insights: "Insights",
  labs: "Lab rosters",
  alerts: "Alerts",
  billing: "Billing",
  settings: "Settings",
  profiles: "Profile",
};

function prettify(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function looksLikeId(segment: string) {
  // UUID, cuid-ish, or long opaque slug - avoid showing raw ids in the mobile title.
  if (segment.length >= 20) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) return true;
  return false;
}

export function AppMobileTitle() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const leaf = segments[segments.length - 1] ?? "app";
  const parent = segments.length >= 2 ? segments[segments.length - 2] : undefined;

  let title: string;
  if (looksLikeId(leaf) && parent && SEGMENT_LABELS[parent]) {
    title = SEGMENT_LABELS[parent];
  } else {
    title = SEGMENT_LABELS[leaf] ?? prettify(leaf);
  }

  return (
    <div className="flex h-12 items-center border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:hidden">
      <h1 className="flex min-w-0 items-center gap-2 truncate text-sm font-semibold tracking-tight"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal signal-pulse" aria-hidden /><span className="truncate font-serif font-medium">{title}</span></h1>
    </div>
  );
}
