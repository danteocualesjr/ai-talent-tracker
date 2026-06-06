import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRelative } from "@/lib/utils";
import { getPublicEvents } from "@/lib/queries";
import type { EventType } from "@/types/db";

const TONE: Record<EventType, "success" | "warning" | "info" | "purple" | "secondary"> = {
  left_company: "warning",
  joined_company: "info",
  went_stealth: "warning",
  headline_signals_founding: "success",
  role_change_internal: "secondary",
  about_changed: "secondary",
  location_changed: "secondary",
  github_dark: "purple",
  new_domain: "success",
  other: "secondary",
};

const LABEL: Record<EventType, string> = {
  left_company: "Left",
  joined_company: "Joined",
  went_stealth: "Stealth",
  headline_signals_founding: "Founding",
  role_change_internal: "Role",
  about_changed: "About",
  location_changed: "Location",
  github_dark: "GH dark",
  new_domain: "Domain",
  other: "Update",
};

const FALLBACK = [
  { name: "Jane Researcher", type: "went_stealth" as EventType, summary: "Member of Technical Staff → Building something new.", when: "14m" },
  { name: "Mike Patel", type: "joined_company" as EventType, summary: "Joined Anthropic as a research engineer.", when: "2h" },
  { name: "Aria Chen", type: "headline_signals_founding" as EventType, summary: "Headline now reads founding engineer.", when: "6h" },
  { name: "Sam Becker", type: "left_company" as EventType, summary: "Left OpenAI after 3 years.", when: "1d" },
  { name: "Priya Singh", type: "went_stealth" as EventType, summary: "Job removed; profile is now blank.", when: "1d" },
  { name: "Diego Romero", type: "new_domain" as EventType, summary: "New domain registered: tessera.ai.", when: "2d" },
];

/**
 * Two-column vertical marquee of recent public events. Renders below the
 * hero on the landing page and gives the visitor a sense of live activity.
 *
 * Falls back to a curated set of plausible-looking samples when no real
 * data is available, so the component never looks empty even on a fresh
 * Supabase setup.
 */
export async function LiveTicker() {
  const events = await getPublicEvents(16);
  const items: Array<{ name: string; type: EventType; summary: string; when: string }> =
    events.length >= 6
      ? events.map((e) => ({
          name: e.profile.full_name || e.profile.linkedin_handle || "Unknown",
          type: e.type,
          summary: e.summary,
          when: formatRelative(e.detected_at),
        }))
      : FALLBACK;

  const half = Math.ceil(items.length / 2);
  const colA = items.slice(0, half);
  const colB = items.slice(half).concat(items.slice(0, Math.max(0, half - (items.length - half))));

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          <span className="font-semibold text-foreground">Live activity</span>
          <span>· refreshed continuously</span>
        </div>
        <Link
          href="/feed"
          className="group inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Open feed
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="grid h-[300px] grid-cols-1 gap-4 overflow-hidden sm:grid-cols-2"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <Column items={[...colA, ...colA]} reverse={false} />
        <Column items={[...colB, ...colB]} reverse className="hidden sm:flex" />
      </div>
    </div>
  );
}

function Column({
  items,
  reverse,
  className,
}: {
  items: Array<{ name: string; type: EventType; summary: string; when: string }>;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative flex flex-col gap-3 ${className ?? ""}`}>
      <div
        className="flex flex-col gap-3 animate-marquee-vertical"
        style={{
          animationDirection: reverse ? "reverse" : "normal",
          animationDuration: reverse ? "32s" : "26s",
        }}
      >
        {items.map((e, i) => (
          <TickerCard key={`${e.name}-${i}`} event={e} />
        ))}
      </div>
    </div>
  );
}

function TickerCard({ event }: { event: { name: string; type: EventType; summary: string; when: string } }) {
  const initials = event.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
  return (
    <div className="surface-card flex items-start gap-3 p-3.5 transition-colors hover:border-foreground/15">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/40 text-[10px] font-bold text-foreground ring-2 ring-background">
        {initials || "??"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-[13px] font-semibold">{event.name}</span>
          <Badge variant={TONE[event.type] ?? "secondary"} className="text-[10px]">
            {LABEL[event.type] ?? "Update"}
          </Badge>
        </div>
        <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-muted-foreground">{event.summary}</p>
        <div className="tnum mt-1 font-mono text-[10px] text-muted-foreground/70">{event.when}</div>
      </div>
    </div>
  );
}
