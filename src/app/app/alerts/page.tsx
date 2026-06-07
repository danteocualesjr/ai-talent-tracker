import { Bell, Mail, MessageSquare, Trash2, Webhook } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addChannel, removeChannel } from "./actions";
import type { NotificationChannel } from "@/types/db";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const db = createAdminClient();
  const { data } = await db.from("notification_channels").select("*").eq("org_id", org.id).order("created_at");
  const channels = (data ?? []) as NotificationChannel[];
  const channelCounts = {
    email: channels.filter((channel) => channel.type === "email").length,
    slack: channels.filter((channel) => channel.type === "slack").length,
    webhook: channels.filter((channel) => channel.type === "webhook").length,
  };

  return (
    <div className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Alerts"
        eyebrow="Workspace"
        icon={<Bell className="h-4 w-4" />}
        description="Where we deliver detected change events."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <ChannelMetric label="Email" value={channelCounts.email} />
        <ChannelMetric label="Slack" value={channelCounts.slack} />
        <ChannelMetric label="Webhooks" value={channelCounts.webhook} />
      </div>

      <div className="surface-card overflow-hidden">
        <div className="border-b border-border/60 px-5 py-4">
          <div className="label-caps">Preview</div>
          <h2 className="mt-1 text-lg font-bold tracking-tight">Sample alert payload</h2>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Alerts include a concise summary, confidence score, profile context, and the changed fields.</p>
            <p>Webhook channels receive the same payload with an optional HMAC signature.</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <div>{"{"}</div>
            <div className="pl-3">&quot;type&quot;: &quot;went_stealth&quot;,</div>
            <div className="pl-3">&quot;confidence&quot;: 0.92,</div>
            <div className="pl-3">&quot;profile&quot;: &quot;Jane Researcher&quot;,</div>
            <div className="pl-3">&quot;summary&quot;: &quot;Headline changed to building something new&quot;</div>
            <div>{"}"}</div>
          </div>
        </div>
      </div>

      <Panel title="Active channels" bodyClassName={channels.length === 0 ? undefined : "divide-y divide-border/60"}>
        {channels.length === 0 ? (
          <EmptyPanel
            icon={<Bell className="h-5 w-5" />}
            title="No channels yet"
            body="Add at least one channel below so we can deliver alerts when a tracked profile changes."
          />
        ) : (
          channels.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <ChannelIcon type={c.type} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{describeChannel(c)}</span>
                    <Badge variant="secondary" className="uppercase">
                      {c.type}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">Triggers on: {c.event_types.join(", ")}</p>
                </div>
              </div>
              <form action={removeChannel}>
                <input type="hidden" name="id" value={c.id} />
                <Button variant="ghost" size="icon" aria-label="Remove channel" className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))
        )}
      </Panel>

      <div className="grid gap-5 md:grid-cols-3">
        <ChannelCard icon={<Mail className="h-4 w-4" />} title="Email" description="Single inbox delivery via Resend.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="email" />
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs font-semibold">
                Email
              </Label>
              <Input id="to" name="to" type="email" required placeholder="alerts@you.com" />
            </div>
            <Button type="submit" className="w-full" size="sm">
              Add email
            </Button>
          </form>
        </ChannelCard>

        <ChannelCard icon={<MessageSquare className="h-4 w-4" />} title="Slack" description="Incoming webhook URL.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="slack" />
            <div className="space-y-1.5">
              <Label htmlFor="webhook_url" className="text-xs font-semibold">
                Webhook URL
              </Label>
              <Input id="webhook_url" name="webhook_url" type="url" required placeholder="https://hooks.slack.com/..." />
            </div>
            <Button type="submit" className="w-full" size="sm">
              Add Slack
            </Button>
          </form>
        </ChannelCard>

        <ChannelCard icon={<Webhook className="h-4 w-4" />} title="Webhook" description="HMAC-signed POST. Team+.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="webhook" />
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs font-semibold">
                URL
              </Label>
              <Input id="url" name="url" type="url" required placeholder="https://api.you.com/events" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secret" className="text-xs font-semibold">
                Secret (optional)
              </Label>
              <Input id="secret" name="secret" type="text" placeholder="signing secret" />
            </div>
            <Button type="submit" className="w-full" size="sm">
              Add webhook
            </Button>
          </form>
        </ChannelCard>
      </div>
    </div>
  );
}

function ChannelMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="surface-card p-4">
      <div className="tnum text-2xl font-bold">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

function ChannelCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="surface-card surface-card-hover p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground shadow-sm">
          {icon}
        </div>
        <div>
          <div className="text-sm font-bold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ChannelIcon({ type }: { type: string }) {
  const icon = type === "email" ? <Mail className="h-4 w-4" /> : type === "slack" ? <MessageSquare className="h-4 w-4" /> : <Webhook className="h-4 w-4" />;
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background text-foreground shadow-sm">
      {icon}
    </div>
  );
}

function describeChannel(c: NotificationChannel): string {
  const cfg = c.config as Record<string, unknown>;
  if (c.type === "email") return String(cfg.to ?? "");
  if (c.type === "slack") return String(cfg.webhook_url ?? "").replace(/\/services\/.*/, "/services/…");
  if (c.type === "webhook") return String(cfg.url ?? "");
  return "";
}
