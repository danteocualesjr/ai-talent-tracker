import Link from "next/link";
import { ArrowRight, Briefcase, Compass, ExternalLink, Globe, LogOut, Pencil, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";
import type { EventRow as EventRowT, Profile, EventType, Json } from "@/types/db";

type Tone = "success" | "warning" | "default" | "secondary" | "info" | "purple";

const DIFF_FIELDS = [
  { key: "current_company", label: "company" },
  { key: "current_title", label: "title" },
  { key: "headline", label: "headline" },
  { key: "location", label: "location" },
] as const;

function formatFieldChanges(before: Json | null, after: Json | null): string[] {
  if (!before || !after || typeof before !== "object" || typeof after !== "object") return [];
  const prev = before as Record<string, unknown>;
  const next = after as Record<string, unknown>;
  const lines: string[] = [];
  for (const { key, label } of DIFF_FIELDS) {
    const from = prev[key];
    const to = next[key];
    if (from == null && to == null) continue;
    if (String(from ?? "") === String(to ?? "")) continue;
    const fromLabel = from != null && String(from) ? String(from) : "—";
    const toLabel = to != null && String(to) ? String(to) : "—";
    lines.push(`${label}: ${fromLabel} → ${toLabel}`);
  }
  return lines;
}

function EventFieldDiff({ before, after }: { before: Json | null; after: Json | null }) {
  const changes = formatFieldChanges(before, after);
  if (changes.length === 0) return null;
  return (
    <ul className="mt-2.5 space-y-1 overflow-hidden rounded-lg border border-border/60 bg-muted/20 text-xs">
      {changes.map((line, i) => {
        const colonIdx = line.indexOf(": ");
        const field = colonIdx > 0 ? line.slice(0, colonIdx) : line;
        const rest = colonIdx > 0 ? line.slice(colonIdx + 2) : "";
        const arrowIdx = rest.indexOf(" → ");
        const from = arrowIdx >= 0 ? rest.slice(0, arrowIdx) : null;
        const to = arrowIdx >= 0 ? rest.slice(arrowIdx + 3) : null;
        return (
          <li
            key={line}
            className={`relative flex flex-wrap items-baseline gap-x-2 gap-y-0.5 border-l-2 border-signal/40 px-3 py-2 leading-relaxed ${i > 0 ? "border-t border-border/50" : ""}`}
          >
            <span className="label-caps shrink-0 text-[10px] normal-case tracking-[0.12em]">{field}</span>
            {from && to ? (
              <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
                <span className="max-w-[12rem] truncate text-muted-foreground line-through decoration-muted-foreground/35 sm:max-w-none">{from}</span>
                <span className="text-signal/60" aria-hidden>→</span>
                <span className="max-w-[12rem] truncate font-medium text-foreground sm:max-w-none">{to}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{rest || line}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const TYPE_META: Record<EventType, { label: string; icon: LucideIcon; tone: Tone; ring: string; rail: string }> = {
  left_company: {
    label: "Left",
    icon: LogOut,
    tone: "warning",
    ring: "text-violet-accent",
    rail: "from-violet-400/0 via-violet-accent/70 to-violet-400/0",
  },
  joined_company: {
    label: "Joined",
    icon: Briefcase,
    tone: "info",
    ring: "text-signal",
    rail: "from-signal/0 via-signal/65 to-signal/0",
  },
  went_stealth: {
    label: "Stealth",
    icon: Compass,
    tone: "warning",
    ring: "text-amber-accent",
    rail: "from-amber-400/0 via-amber-accent/75 to-amber-400/0",
  },
  headline_signals_founding: {
    label: "Founding signal",
    icon: Star,
    tone: "success",
    ring: "text-signal",
    rail: "from-signal/0 via-signal/80 to-signal/0",
  },
  role_change_internal: {
    label: "Role change",
    icon: Pencil,
    tone: "secondary",
    ring: "text-muted-foreground",
    rail: "from-border/0 via-border to-border/0",
  },
  about_changed: {
    label: "About updated",
    icon: Pencil,
    tone: "secondary",
    ring: "text-muted-foreground",
    rail: "from-border/0 via-border to-border/0",
  },
  location_changed: {
    label: "Location",
    icon: Globe,
    tone: "secondary",
    ring: "text-muted-foreground",
    rail: "from-border/0 via-border to-border/0",
  },
  github_dark: {
    label: "GitHub dark",
    icon: Sparkles,
    tone: "purple",
    ring: "text-violet-accent",
    rail: "from-violet-400/0 via-violet-accent/70 to-violet-400/0",
  },
  new_domain: {
    label: "New domain",
    icon: Globe,
    tone: "success",
    ring: "text-signal",
    rail: "from-signal/0 via-signal/75 to-signal/0",
  },
  other: {
    label: "Update",
    icon: Pencil,
    tone: "secondary",
    ring: "text-muted-foreground",
    rail: "from-border/0 via-border to-border/0",
  },
};

export function EventListItem({ event, profile, href }: { event: EventRowT; profile: Profile; href?: string }) {
  const initials = (profile.full_name || profile.linkedin_handle || "??").slice(0, 2).toUpperCase();
  const meta = TYPE_META[event.type] ?? TYPE_META.other;
  const Icon = meta.icon;

  return (
    <div className="group relative flex items-start gap-4 px-5 py-4 transition-all duration-200 odd:bg-muted/[0.12] hover:bg-muted/40 focus-within:bg-muted/30 motion-safe:hover:shadow-[inset_0_0_0_1px_hsl(var(--border)/0.5)]">
      {/* Accent rail on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 ${meta.rail}`}
      />

      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm motion-safe:transition-all motion-safe:group-hover:scale-[1.03] motion-safe:group-hover:ring-signal/20">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} /> : null}
          <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-card shadow-sm ${meta.ring}`}>
          <Icon className="h-2.5 w-2.5" />
        </div>
      </div>

      <div className="min-w-0 flex-1 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:translate-x-0.5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:pr-16">
          <Link
            href={href ?? `/app/profiles/${profile.id}`}
            className="inline-flex min-w-0 max-w-full items-center gap-1 truncate text-sm font-semibold transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            <span className="truncate">{profile.full_name || profile.linkedin_handle}</span>
            <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-all motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:opacity-100" />
          </Link>
          <Badge variant={meta.tone}>{meta.label}</Badge>
          {event.confidence >= 0.7 && (
            <span
              className={`tnum rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
                event.confidence >= 0.8
                  ? "bg-signal/10 text-signal ring-signal/25"
                  : "bg-muted text-muted-foreground ring-border/60"
              }`}
              title={`Detection confidence: ${Math.round(event.confidence * 100)}%`}
            >
              {Math.round(event.confidence * 100)}%
            </span>
          )}
          <span className="tnum ml-auto text-xs text-muted-foreground sm:ml-0">{formatRelative(event.detected_at)}</span>
        </div>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {event.summary}
        </p>
        <EventFieldDiff before={event.before} after={event.after} />
        {profile.headline && (
          <p className="mt-1 truncate text-xs text-muted-foreground/70">{profile.headline}</p>
        )}
      </div>

      <a
        href={profile.linkedin_url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${profile.full_name || profile.linkedin_handle} on LinkedIn`}
        className="inline-flex shrink-0 items-center gap-1 self-center rounded-md border border-border/70 bg-background px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-100 shadow-sm transition-all hover:border-signal/40 hover:text-signal sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40"
      >
        LinkedIn <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

export function EventTimelineItem({ event, profile }: { event: EventRowT; profile: Profile }) {
  const meta = TYPE_META[event.type] ?? TYPE_META.other;
  const Icon = meta.icon;
  return (
    <div className="group relative pb-8 pl-10 last:pb-0 motion-safe:transition-colors motion-safe:hover:rounded-lg motion-safe:hover:bg-muted/25 motion-safe:hover:pl-11 [&:last-child_.timeline-connector]:hidden">
      <div className="timeline-connector absolute bottom-0 left-[13px] top-7 w-px bg-gradient-to-b from-border via-border/60 to-transparent" aria-hidden />
      <div className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card ring-4 ring-background shadow-sm transition-shadow motion-safe:group-hover:shadow-md ${meta.ring}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={meta.tone}>{meta.label}</Badge>
        {event.confidence >= 0.7 && (
          <span
            className={`tnum rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
              event.confidence >= 0.8
                ? "bg-signal/10 text-signal ring-signal/25"
                : "bg-muted text-muted-foreground ring-border/60"
            }`}
            title={`Detection confidence: ${Math.round(event.confidence * 100)}%`}
          >
            {Math.round(event.confidence * 100)}%
          </span>
        )}
        <span className="tnum text-xs text-muted-foreground">{formatRelative(event.detected_at)}</span>
      </div>
      <p className="mt-1.5 text-pretty text-sm leading-relaxed">{event.summary}</p>
      <EventFieldDiff before={event.before} after={event.after} />
      <Link
        href={`/app/profiles/${profile.id}`}
        className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Open profile{" "}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
