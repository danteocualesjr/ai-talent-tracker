import { ArrowRight, Compass, LogOut, Star, Users2 } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { EmptyPanel, Panel } from "@/components/panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getLabBySlug, listLabProfiles } from "@/lib/queries";
import { formatRelative } from "@/lib/utils";
import { AddLabRosterButton } from "../add-lab-roster-button";
import { LabRosterList } from "../lab-roster-list";

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
            <Image
              src={lab.logo_url}
              alt={lab.name}
              width={64}
              height={64}
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

      <LabRosterList labName={lab.name} people={people} />
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
