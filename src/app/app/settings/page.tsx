import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/panel";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  return (
    <div className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader title="Settings" description="Workspace identifiers and account info." />

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
    <div className="flex items-center justify-between px-5 py-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-medium ${mono ? "font-mono text-xs text-muted-foreground" : ""} ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
