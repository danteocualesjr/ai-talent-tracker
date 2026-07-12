import { ArrowRight, Compass, LogOut, Star, Users2 } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { EmptyPanel, Panel } from "@/components/panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { formatRelative } from "@/lib/utils";
import { AddLabRosterButton } from "../add-lab-roster-button";
import { TrackProfileButton } from "../track-profile-button";

export default async function LabRosterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lab = await getLabBySlug(slug);
  if (!lab) notFound();
  const people = await listLabProfiles(lab.id, 500);

  const stealth = people.filter((p) => p.status === "stealth").length;
  const left = people.filter((p) => p.status === "left").length;
  const founders = people.filter((p) => p.status === "founder").length;
  const active = people.filter((p) => p.status === "active").length;

  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <BackLink href="/app/labs">Back to labs</BackLink>

      <div className="surface-elevated rounded-2xl border border-border/60 bg-card p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          {lab.logo_url ? (
            <img
              src={lab.logo_url}
              alt={lab.name}
              className="h-16 w-16 rounded-2xl border border-border/60 bg-muted object-contain p-2"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border/60 bg-muted text-2xl font-bold">
              {lab.name.slice(0, 1)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{lab.name}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {lab.description} · {lab.domain}
            </p>
          </div>
          <AddLabRosterButton labId={lab.id} labSlug={lab.slug} count={people.length} />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="Indexed" value={people.length} />
          <Stat label="Stealth" value={stealth} tone="signal" />
          <Stat label="Left" value={left} tone="muted" />
        </div>
      </div>

      <div className="surface-card grid gap-3 p-5 sm:grid-cols-4">
        {([
          { label: "Active", value: active, icon: Users2, accent: "text-foreground/70" },
          { label: "Stealth", value: stealth, icon: Compass, accent: "text-amber-accent" },
          { label: "Founders", value: founders, icon: Star, accent: "text-signal" },
          { label: "Departed", value: left, icon: LogOut, accent: "text-violet-accent" },
        ] as const).map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="group surface-card-hover rounded-xl border border-border/60 bg-background p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="tnum text-2xl font-bold">{value}</div>
                <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
              </div>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-muted/80 ${accent} transition-transform motion-safe:group-hover:scale-105`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Employees" bodyClassName={people.length === 0 ? undefined : "divide-y divide-border/60"}>
        {people.length === 0 ? (
          <EmptyPanel
            icon={<span className="text-lg font-bold">{lab.name.slice(0, 1)}</span>}
            title="No people indexed yet"
            body="This lab roster is still being built. Check back after the next sync."
          />
        ) : (
          people.map((p) => {
            const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
            return (
              <div key={p.id} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-signal/0 via-signal/60 to-signal/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]">
                  {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-semibold transition-colors hover:text-foreground hover:underline underline-offset-4">
                    {p.full_name || p.linkedin_handle}
                  </Link>
                  <p className="truncate text-sm text-muted-foreground">{p.headline ?? p.current_title ?? ""}</p>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {p.status}
                </Badge>
                {p.linkedin_url && (
                  <TrackProfileButton linkedinUrl={p.linkedin_url} profileName={p.full_name || p.linkedin_handle || "profile"} />
                )}
                <div className="tnum hidden font-mono text-xs text-muted-foreground sm:block">
                  {formatRelative(p.last_synced_at)}
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "signal" | "muted" }) {
  const valueClass =
    tone === "signal" ? "text-signal" : tone === "muted" ? "text-muted-foreground" : "text-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-background px-4 py-3.5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={`tnum mt-1 text-2xl font-bold ${valueClass}`}>{value}</div>
    </div>
  );
}
