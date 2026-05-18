import Link from "next/link";
import { ArrowRight, Briefcase, Compass, ExternalLink, Globe, LogOut, Pencil, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";
import type { EventRow as EventRowT, Profile, EventType } from "@/types/db";

const TYPE_META: Record<EventType, { label: string; icon: LucideIcon; tone: "success" | "warning" | "default" | "secondary"; bg: string }> = {
  left_company:              { label: "Left",              icon: LogOut,    tone: "warning", bg: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-300" },
  joined_company:            { label: "Joined",            icon: Briefcase, tone: "default", bg: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300" },
  went_stealth:              { label: "Stealth",           icon: Compass,   tone: "warning", bg: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300" },
  headline_signals_founding: { label: "Founding signal",   icon: Star,      tone: "success", bg: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300" },
  role_change_internal:      { label: "Role change",       icon: Pencil,    tone: "secondary", bg: "bg-muted text-foreground" },
  about_changed:             { label: "About updated",     icon: Pencil,    tone: "secondary", bg: "bg-muted text-foreground" },
  location_changed:          { label: "Location",          icon: Globe,     tone: "secondary", bg: "bg-muted text-foreground" },
  github_dark:               { label: "GitHub dark",       icon: Sparkles,  tone: "warning", bg: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-300" },
  new_domain:                { label: "New domain",        icon: Globe,     tone: "success", bg: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-300" },
  other:                     { label: "Update",            icon: Pencil,    tone: "secondary", bg: "bg-muted text-foreground" },
};

export function EventListItem({ event, profile, href }: { event: EventRowT; profile: Profile; href?: string }) {
  const initials = (profile.full_name || profile.linkedin_handle || "??").slice(0, 2).toUpperCase();
  const meta = TYPE_META[event.type] ?? TYPE_META.other;
  const Icon = meta.icon;

  return (
    <div className="group relative flex items-start gap-3 border-b py-4 last:border-b-0">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10">
          {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-card ${meta.bg}`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Link href={href ?? `/app/profiles/${profile.id}`} className="truncate font-medium hover:underline">
            {profile.full_name || profile.linkedin_handle}
          </Link>
          <Badge variant={meta.tone}>{meta.label}</Badge>
          <span className="text-xs text-muted-foreground">· {formatRelative(event.detected_at)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{event.summary}</p>
        {profile.headline && (
          <p className="mt-1 truncate text-xs text-muted-foreground/80">{profile.headline}</p>
        )}
      </div>

      <a
        href={profile.linkedin_url}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex shrink-0 items-center gap-1 self-center rounded-md border bg-background px-2.5 py-1 text-xs text-muted-foreground opacity-0 transition hover:text-foreground group-hover:opacity-100"
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
    <div className="relative pl-10">
      <div className={`absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background ${meta.bg}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={meta.tone}>{meta.label}</Badge>
        <span className="text-xs text-muted-foreground">{formatRelative(event.detected_at)}</span>
      </div>
      <p className="mt-1 text-sm">{event.summary}</p>
      <Link href={`/app/profiles/${profile.id}`} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
        Open profile <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
