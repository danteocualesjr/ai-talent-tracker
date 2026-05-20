import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Workspace identifiers and account info.</p>
      </header>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-5 py-3 text-sm font-semibold">Workspace</div>
        <dl className="divide-y text-sm">
          <Row label="Name" value={org.name} />
          <Row label="Slug" value={org.slug} mono />
          <Row label="Plan" value={org.plan} capitalize />
          <Row label="Profile limit" value={String(org.profile_limit)} />
          <Row label="Refresh cadence" value={org.refresh_cadence} />
        </dl>
      </section>

      <section className="rounded-lg border bg-card">
        <div className="border-b px-5 py-3 text-sm font-semibold">Account</div>
        <dl className="divide-y text-sm">
          <Row label="Email" value={user!.email ?? ""} />
          <Row label="User ID" value={user!.id} mono />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value, mono, capitalize }: { label: string; value: string; mono?: boolean; capitalize?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`${mono ? "font-mono text-xs" : ""} ${capitalize ? "capitalize" : ""}`}>{value}</dd>
    </div>
  );
}
