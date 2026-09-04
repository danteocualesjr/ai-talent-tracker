import Link from "next/link";
import { Compass, ListChecks, LogOut, Star, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { AddProfilesPanel } from "./add-profiles-panel";
import { CopyUrlsButton } from "./copy-urls-button";
import { ExportWatchlistButton } from "./export-watchlist-button";
import { WatchlistProfiles } from "./watchlist-profiles";
import { cn } from "@/lib/utils";

export const metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const profiles = await listOrgProfiles(org.id);

  const fill = Math.min(100, (profiles.length / org.profile_limit) * 100);
  const capacityTone =
    fill >= 100 ? "full" : fill >= 85 ? "warning" : "default";
  const statusCounts = {
    active: profiles.filter((profile) => profile.status === "active").length,
    stealth: profiles.filter((profile) => profile.status === "stealth").length,
    founder: profiles.filter((profile) => profile.status === "founder").length,
    left: profiles.filter((profile) => profile.status === "left").length,
  };

  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Watchlist"
        eyebrow="Tracking"
        icon={<ListChecks className="h-4 w-4" />}
        description="Profiles you're tracking across your organization."
        divider
      >
        <div className="w-full min-w-[260px] surface-card p-4 sm:w-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              <span className="tnum font-bold text-foreground">{profiles.length}</span> /{" "}
              <span className="tnum">{org.profile_limit}</span> profiles
            </span>
            <span className="font-medium text-foreground">{org.refresh_cadence}</span>
          </div>
          <div
            className="progress-track mt-3"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={org.profile_limit}
            aria-valuenow={profiles.length}
            aria-label="Watchlist capacity"
          >
            <div
              className={cn(
                "progress-fill",
                capacityTone === "warning" && "!from-amber-500/90 !to-amber-500",
                capacityTone === "full" && "!from-destructive/90 !to-destructive",
              )}
              style={{ width: `${fill}%` }}
            />
          </div>
          {capacityTone !== "default" && (
            <p
              className={cn(
                "mt-2 text-[11px] font-medium",
                capacityTone === "full" ? "text-destructive" : "text-amber-700 dark:text-amber-400",
              )}
            >
              {capacityTone === "full"
                ? "Profile limit reached — remove profiles or upgrade your plan."
                : "Almost at your profile limit."}
            </p>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {([
          { label: "Active", value: statusCounts.active, icon: Users2, accent: "text-foreground/70", rail: "from-foreground/0 via-foreground/25 to-foreground/0" },
          { label: "Stealth", value: statusCounts.stealth, icon: Compass, accent: "text-amber-accent", rail: "from-amber-400/0 via-amber-accent/70 to-amber-400/0" },
          { label: "Founder", value: statusCounts.founder, icon: Star, accent: "text-signal", rail: "from-signal/0 via-signal/60 to-signal/0" },
          { label: "Left", value: statusCounts.left, icon: LogOut, accent: "text-violet-accent", rail: "from-violet-400/0 via-violet-accent/65 to-violet-400/0" },
        ] as const).map(({ label, value, icon: Icon, accent, rail }) => (
          <div key={label} className="group surface-card surface-card-hover relative overflow-hidden p-4">
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-y-3 left-0 w-0.5 rounded-full bg-gradient-to-b opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${rail}`}
            />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="tnum font-serif text-2xl font-medium tracking-tight">{value}</div>
                <div className="mt-1 label-caps text-muted-foreground">{label}</div>
              </div>
              <div className={`flex h-7 w-7 items-center justify-center rounded-md border border-border/60 bg-muted/70 ${accent} motion-safe:transition-transform motion-safe:group-hover:scale-105`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Add profiles" description="Track a single URL or bulk-import a CSV roster. The first refresh runs immediately." bodyClassName="p-5">
        <AddProfilesPanel />
      </Panel>

      <div className="surface-card relative overflow-hidden p-5 md:grid md:grid-cols-3 md:gap-4 md:divide-x md:divide-border/60">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-signal/50 to-transparent" />
        {[
          ["1", "Paste priority profiles", "Start with researchers, founders, or hiring targets your team already tracks."],
          ["2", "Refresh immediately", "Use the row action after adding a profile to pull the latest public snapshot."],
          ["3", "Route alerts", "Connect Slack, email, or webhooks so changes reach the right channel."],
        ].map(([step, title, body]) => (
          <div key={step} className="group flex gap-3 py-4 first:pt-0 last:pb-0 md:flex-col md:py-0 md:px-4 md:first:pl-0 md:last:pr-0">
            <div className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background ring-4 ring-signal/10 motion-safe:transition-transform motion-safe:group-hover:scale-105">
              {step}
            </div>
            <div>
              <div className="text-sm font-semibold">{title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <Panel
        title="Tracked profiles"
        action={
          <div className="flex items-center gap-2">
            <CopyUrlsButton profiles={profiles} />
            {(org.plan === "team" || org.plan === "enterprise") && <ExportWatchlistButton />}
            <span className="tnum text-xs text-muted-foreground">{profiles.length} total</span>
          </div>
        }
        bodyClassName={profiles.length === 0 ? undefined : "divide-y divide-border/60"}
      >
        {profiles.length === 0 ? (
          <EmptyPanel
            icon={<ListChecks className="h-5 w-5" />}
            title="No profiles yet"
            body="Paste a LinkedIn URL above, import a CSV roster, or browse curated lab rosters to bulk-add."
            cta={
              <Button asChild variant="outline">
                <Link href="/app/labs">Browse lab rosters</Link>
              </Button>
            }
          />
        ) : (
          <WatchlistProfiles profiles={profiles} />
        )}
      </Panel>
    </div>
  );
}
