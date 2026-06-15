import Link from "next/link";
import { Compass, ListChecks, LogOut, RefreshCw, Star, Trash2, Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddProfileForm } from "./add-profile-form";
import { removeProfileForm, refreshNowForm } from "./actions";
import { formatRelative, cn } from "@/lib/utils";

export const metadata = { title: "Watchlist" };

const STATUS_TONE: Record<string, "default" | "secondary" | "success" | "warning"> = {
  active: "secondary",
  left: "warning",
  stealth: "warning",
  founder: "success",
  unknown: "secondary",
};

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
          { label: "Active", value: statusCounts.active, icon: Users2, accent: "text-foreground/70", border: "border-l-foreground/20" },
          { label: "Stealth", value: statusCounts.stealth, icon: Compass, accent: "text-amber-accent", border: "border-l-amber-500/60" },
          { label: "Founder", value: statusCounts.founder, icon: Star, accent: "text-signal", border: "border-l-signal/60" },
          { label: "Left", value: statusCounts.left, icon: LogOut, accent: "text-violet-accent", border: "border-l-violet-500/50" },
        ] as const).map(({ label, value, icon: Icon, accent, border }) => (
          <div key={label} className={`surface-card surface-card-hover group relative overflow-hidden border-l-2 p-4 ${border}`}>
            <div className="pointer-events-none absolute -right-4 -top-4 h-14 w-14 rounded-full bg-signal/5 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="tnum text-2xl font-bold">{value}</div>
                <div className="mt-1 label-caps text-muted-foreground">{label}</div>
              </div>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-muted/80 ${accent} transition-transform motion-safe:group-hover:scale-105`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Panel title="Add a LinkedIn profile" description="Paste any public profile URL. The first refresh runs immediately." bodyClassName="p-5">
        <AddProfileForm />
      </Panel>

      <div className="surface-card grid gap-4 p-5 md:grid-cols-3">
        {[
          ["1", "Paste priority profiles", "Start with researchers, founders, or hiring targets your team already tracks."],
          ["2", "Refresh immediately", "Use the row action after adding a profile to pull the latest public snapshot."],
          ["3", "Route alerts", "Connect Slack, email, or webhooks so changes reach the right channel."],
        ].map(([step, title, body]) => (
          <div key={step} className="flex gap-3">
            <div className="tnum flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-background">
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
        action={<span className="tnum text-xs text-muted-foreground">{profiles.length} total</span>}
        bodyClassName={profiles.length === 0 ? undefined : "divide-y divide-border/60"}
      >
        {profiles.length === 0 ? (
          <EmptyPanel
            icon={<ListChecks className="h-5 w-5" />}
            title="No profiles yet"
            body="Paste a LinkedIn URL above or browse curated lab rosters to bulk-add."
            cta={
              <Button asChild variant="outline">
                <Link href="/app/labs">Browse lab rosters</Link>
              </Button>
            }
          />
        ) : (
          profiles.map((p) => {
            const initials = (p.full_name || p.linkedin_handle || "??").slice(0, 2).toUpperCase();
            return (
              <div key={p.id} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-signal/0 via-signal/60 to-signal/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]">
                  {p.avatar_url ? <AvatarImage src={p.avatar_url} alt={p.full_name ?? ""} /> : null}
                  <AvatarFallback className="text-[11px]">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link href={`/app/profiles/${p.id}`} className="truncate text-sm font-semibold transition-colors hover:text-foreground hover:underline underline-offset-4">
                      {p.full_name || p.linkedin_handle}
                    </Link>
                    <Badge variant={STATUS_TONE[p.status] ?? "secondary"} className="capitalize">
                      {p.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {p.headline || p.current_title || p.current_company || "—"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/70">
                    Last synced {formatRelative(p.last_synced_at)} · {p.current_company ?? "no current company"}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <form action={refreshNowForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Refresh now" className="rounded-lg text-muted-foreground hover:text-foreground">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </form>
                  <form action={removeProfileForm}>
                    <input type="hidden" name="profile_id" value={p.id} />
                    <Button variant="ghost" size="icon" title="Remove" className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            );
          })
        )}
      </Panel>
    </div>
  );
}
