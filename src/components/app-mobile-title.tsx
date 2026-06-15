"use client";

import { usePathname } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  app: "Dashboard",
  watchlist: "Watchlist",
  events: "Events",
  labs: "Lab rosters",
  alerts: "Alerts",
  billing: "Billing",
  settings: "Settings",
  profiles: "Profile",
};

function prettify(segment: string) {
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppMobileTitle() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const leaf = segments[segments.length - 1] ?? "app";
  const title = SEGMENT_LABELS[leaf] ?? prettify(leaf);

  return (
    <div className="flex h-12 items-center border-b border-border/60 bg-background/90 px-4 backdrop-blur-md md:hidden">
      <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
    </div>
  );
}
