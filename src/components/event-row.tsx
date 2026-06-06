import Link from "next/link";
import { ArrowRight, Briefcase, Compass, ExternalLink, Globe, LogOut, Pencil, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";
import type { EventRow as EventRowT, Profile, EventType } from "@/types/db";

type Tone = "success" | "warning" | "default" | "secondary" | "info" | "purple";

const TYPE_META: Record<EventType, { label: string; icon: LucideIcon; tone: Tone; ring: string; rail: string }> = {
  left_company: {
    label: "Left",
    icon: LogOut,
    tone: "warning",
    ring: "text-rose-700 dark:text-rose-300",
    rail: "from-rose-300/0 via-rose-400/70 to-rose-300/0 dark:via-rose-300/60",
  },
  joined_company: {
    label: "Joined",
    icon: Briefcase,
    tone: "info",
    ring: "text-blue-700 dark:text-blue-300",
    rail: "from-blue-300/0 via-blue-400/70 to-blue-300/0 dark:via-blue-300/60",
  },
  went_stealth: {
    label: "Stealth",
    icon: Compass,
    tone: "warning",
    ring: "text-amber-700 dark:text-amber-300",
    rail: "from-amber-300/0 via-amber-400/80 to-amber-300/0 dark:via-amber-300/60",
  },
  headline_signals_founding: {
    label: "Founding signal",
    icon: Star,
    tone: "success",
    ring: "text-emerald-700 dark:text-emerald-300",
    rail: "from-emerald-300/0 via-emerald-400/80 to-emerald-300/0 dark:via-emerald-300/60",
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
    ring: "text-violet-700 dark:text-violet-300",
    rail: "from-violet-300/0 via-violet-400/70 to-violet-300/0 dark:via-violet-300/60",
  },
  new_domain: {
    label: "New domain",
    icon: Globe,
    tone: "success",
    ring: "text-emerald-700 dark:text-emerald-300",
    rail: "from-emerald-300/0 via-emerald-400/80 to-emerald-300/0 dark:via-emerald-300/60",
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
    <div className="group relative flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40 focus-within:bg-muted/30">
      {/* Accent rail on hover */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${meta.rail}`}
      />

      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} /> : null}
          <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-card bg-card shadow-sm ${meta.ring}`}>
          <Icon className="h-2.5 w-2.5" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            href={href ?? `/app/profiles/${profile.id}`}
            className="truncate text-sm font-semibold transition-colors hover:text-foreground hover:underline underline-offset-4"
          >
            {profile.full_name || profile.linkedin_handle}
          </Link>
          <Badge variant={meta.tone}>{meta.label}</Badge>
          <span className="tnum text-xs text-muted-foreground">{formatRelative(event.detected_at)}</span>
        </div>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {event.summary}
        </p>
        {profile.headline && (
          <p className="mt-1 truncate text-xs text-muted-foreground/60">{profile.headline}</p>
        )}
      </div>

      <a
        href={profile.linkedin_url}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={`Open ${profile.full_name || profile.linkedin_handle} on LinkedIn`}
        className="inline-flex shrink-0 items-center gap-1 self-center rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-0 shadow-sm transition-all hover:border-foreground/20 hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40"
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
    <div className="group relative pl-10">
      <div className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-card ring-4 ring-background shadow-sm ${meta.ring}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={meta.tone}>{meta.label}</Badge>
        <span className="tnum text-xs text-muted-foreground">{formatRelative(event.detected_at)}</span>
      </div>
      <p className="mt-1.5 text-pretty text-sm leading-relaxed">{event.summary}</p>
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
