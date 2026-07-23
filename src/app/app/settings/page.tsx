import { Building2, Clock, CreditCard, Settings as SettingsIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";
import { ThemeSettings } from "@/components/theme-settings";
import { CopyButton } from "@/components/copy-button";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const readiness = [
    { label: "Workspace", value: org.name ? "Ready" : "Needs name", status: org.name ? "ready" : "warn", icon: Building2, accent: "text-signal" },
    { label: "Plan", value: org.plan, status: "ready" as const, icon: CreditCard, accent: "text-violet-accent" },
    { label: "Cadence", value: org.refresh_cadence, status: "ready" as const, icon: Clock, accent: "text-amber-accent" },
  ];

  return (
    <div className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Settings"
        eyebrow="Workspace"
        icon={<SettingsIcon className="h-4 w-4" />}
        description="Workspace identifiers and account info."
        divider
      />

      <Panel title="Appearance" description="Choose how the app looks on this device.">
        <ThemeSettings />
      </Panel>

      <Panel title="Workspace readiness" description="Quick setup status for this organization." bodyClassName="grid gap-3 p-5 sm:grid-cols-3">
        {readiness.map(({ label, value, status, icon: Icon, accent }) => (
          <div key={label} className="group surface-card-hover rounded-xl border border-border/60 bg-muted/30 p-4 transition-colors hover:border-foreground/12">
            <div className="flex items-center justify-between gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-background ${accent} shadow-sm transition-transform motion-safe:group-hover:scale-105`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${status === "ready" ? "bg-signal signal-pulse" : "bg-amber-500"}`}
                aria-hidden
              />
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-semibold capitalize">{value}</div>
          </div>
        ))}
      </Panel>

      <Panel title="Workspace" bodyClassName="divide-y divide-border/60">
        <Row label="Name" value={org.name} />
        <Row label="Slug" value={org.slug} mono />
        <Row label="Plan" value={org.plan} capitalize />
        <Row label="Profile limit" value={String(org.profile_limit)} />
        <Row label="Refresh cadence" value={org.refresh_cadence} />
      </Panel>

      <Panel title="Account" bodyClassName="divide-y divide-border/60">
        <Row label="Email" value={user!.email ?? ""} />
        <Row label="User ID" value={user!.id} mono />
      </Panel>
    </div>
  );
}

function Row({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="group relative flex items-center justify-between gap-3 px-5 py-4 text-sm transition-colors hover:bg-muted/30 focus-within:bg-muted/20">
      <span aria-hidden className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-signal/0 via-signal/60 to-signal/0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />
      <dt className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground/80">{label}</dt>
      <div className="flex min-w-0 items-center gap-2">
        <dd className={`truncate font-medium transition-colors group-hover:text-foreground ${mono ? "font-mono text-xs text-muted-foreground group-hover:text-foreground/90" : ""} ${capitalize ? "capitalize" : ""}`}>
          {value}
        </dd>
        {mono && <CopyButton value={value} className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100" />}
      </div>
    </div>
  );
}
