import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EventListItem } from "@/components/event-row";
import { formatRelative } from "@/lib/utils";
import type { EventRow, Profile, ProfileSnapshot } from "@/types/db";

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const { data: profile } = await db.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();
  const p = profile as Profile;

  const [{ data: events }, { data: snaps }] = await Promise.all([
    db.from("events").select("*").eq("profile_id", id).order("detected_at", { ascending: false }).limit(50),
    db.from("profile_snapshots").select("*").eq("profile_id", id).order("fetched_at", { ascending: false }).limit(10),
  ]);

  const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();

  return (
    <div className="container max-w-4xl space-y-6 py-8">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              <a href={p.linkedin_url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                {p.full_name || p.linkedin_handle}
              </a>
            </h1>
            <Badge variant="secondary" className="capitalize">{p.status}</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">{p.headline}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {p.current_title ? `${p.current_title} at ` : ""}{p.current_company ?? "—"} · {p.location ?? "—"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Last synced {formatRelative(p.last_synced_at)}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {(events ?? []).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No changes detected yet.</div>
          ) : (events as EventRow[]).map((e) => (
            <EventListItem key={e.id} event={e} profile={p} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent snapshots</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {(snaps ?? []).length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No snapshots yet.</div>
          ) : (snaps as ProfileSnapshot[]).map((s) => (
            <div key={s.id} className="flex items-center justify-between py-2 text-xs">
              <span className="font-mono">{s.content_hash.slice(0, 12)}</span>
              <span className="text-muted-foreground">source: {s.source}</span>
              <span>{formatRelative(s.fetched_at)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
