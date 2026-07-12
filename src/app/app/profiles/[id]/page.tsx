import Link from "next/link";
import { notFound } from "next/navigation";
import { Activity, Camera, ExternalLink, Github, Sparkles } from "lucide-react";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BackLink } from "@/components/back-link";
import { Panel, EmptyPanel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { RefreshProfileButton } from "@/app/app/watchlist/refresh-profile-button";
import { EventTimelineItem } from "@/components/event-row";
import { formatRelative } from "@/lib/utils";
import type { EventRow, Profile, ProfileSnapshot } from "@/types/db";

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured()) notFound();
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();
  const p = profile as Profile;

  const [{ data: events }, { data: snaps }] = await Promise.all([
    db.from("events").select("*").eq("profile_id", id).order("detected_at", { ascending: false }).limit(50),
    db.from("profile_snapshots").select("*").eq("profile_id", id).order("fetched_at", { ascending: false }).limit(10),
  ]);

  const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
  const eventList = (events ?? []) as EventRow[];
  const snapshotList = (snaps ?? []) as ProfileSnapshot[];
  const latestConfidence = eventList[0] ? `${Math.round(eventList[0].confidence * 100)}%` : "—";

  return (
    <div className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <BackLink href="/app/watchlist">Back to watchlist</BackLink>

      <div className="surface-elevated relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-signal/8 blur-3xl" />
        <div className="relative flex items-start gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-border shadow-sm">
            {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {p.full_name || p.linkedin_handle}
              </h1>
              <Badge variant="secondary" className="capitalize">{p.status}</Badge>
            </div>
            <p className="mt-1 text-muted-foreground">{p.headline ?? "—"}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {p.current_title ? `${p.current_title} at ` : ""}
              <span className="font-medium text-foreground">{p.current_company ?? "—"}</span>
              {p.location && <> · {p.location}</>}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <RefreshProfileButton profileId={p.id} profileName={p.full_name || p.linkedin_handle || "profile"} labeled />
              <Button asChild size="sm" variant="outline">
                <a href={p.linkedin_url} target="_blank" rel="noreferrer noopener">
                  LinkedIn <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
              {p.github_handle && (
                <Button asChild size="sm" variant="outline">
                  <a href={`https://github.com/${p.github_handle}`} target="_blank" rel="noreferrer noopener">
                    <Github className="mr-1 h-3 w-3" /> {p.github_handle}
                  </a>
                </Button>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Last synced {formatRelative(p.last_synced_at)} · next sync {formatRelative(p.next_sync_at)}
            </p>
          </div>
        </div>
        {p.about && (
          <div className="mt-5 border-t pt-5 text-sm text-muted-foreground">
            <div className="text-xs font-semibold uppercase tracking-widest text-foreground/70">About</div>
            <p className="mt-2 whitespace-pre-line">{p.about}</p>
          </div>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ProfileMetric label="Events" value={eventList.length} icon={<Activity className="h-3.5 w-3.5" />} accent="text-signal" />
        <ProfileMetric label="Snapshots" value={snapshotList.length} icon={<Camera className="h-3.5 w-3.5" />} accent="text-violet-accent" />
        <ProfileMetric label="Latest confidence" value={latestConfidence} icon={<Sparkles className="h-3.5 w-3.5" />} accent="text-amber-accent" />
      </div>

      {p.github_handle && (
        <div className="surface-card flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Github className="h-4 w-4 text-violet-accent" />
            GitHub activity
          </div>
          <span className="text-muted-foreground">
            {p.github_commits_30d != null ? (
              <>
                <span className="tnum font-semibold text-foreground">{p.github_commits_30d}</span> commits in last 30 days
              </>
            ) : (
              "Not synced yet"
            )}
          </span>
          {p.github_last_commit_at && (
            <span className="text-muted-foreground">
              Last commit {formatRelative(p.github_last_commit_at)}
            </span>
          )}
        </div>
      )}

      <Panel title="Event timeline" bodyClassName="p-6">
          {eventList.length === 0 ? (
            <EmptyPanel
              icon={<Activity className="h-5 w-5" />}
              title="No changes yet"
              body="We'll surface job moves, stealth signals, and headline updates here after the next refresh."
            />
          ) : (
            <div className="space-y-6">
              {eventList.map((e) => (
                <EventTimelineItem key={e.id} event={e} profile={p} />
              ))}
            </div>
          )}
      </Panel>

      <Panel title="Recent snapshots" bodyClassName="divide-y divide-border/60">
          {snapshotList.length === 0 ? (
            <EmptyPanel
              icon={<Camera className="h-5 w-5" />}
              title="No snapshots yet"
              body="Profile snapshots appear after the first successful sync from our data provider."
            />
          ) : snapshotList.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3 text-xs transition-colors hover:bg-muted/30">
              <span className="font-medium text-foreground">Snapshot {formatRelative(s.fetched_at)}</span>
              <span className="text-muted-foreground">source: {s.source}</span>
              <span className="font-mono text-muted-foreground/70">{s.content_hash.slice(0, 8)}…</span>
            </div>
          ))}
      </Panel>
    </div>
  );
}

function ProfileMetric({
  label,
  value,
  icon,
  accent = "text-muted-foreground",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="surface-card surface-card-hover group relative overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="tnum text-2xl font-bold">{value}</div>
          <div className="mt-1 label-caps text-muted-foreground">{label}</div>
        </div>
        {icon && (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 ${accent} transition-transform motion-safe:group-hover:scale-105`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
