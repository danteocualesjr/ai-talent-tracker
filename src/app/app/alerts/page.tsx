import { Bell, Mail, MessageSquare, Trash2, Webhook } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel, Panel } from "@/components/panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeChannel } from "./actions";
import {
  AddChannelForm,
  EmailChannelFields,
  SlackChannelFields,
  WebhookChannelFields,
} from "./add-channel-form";
import type { NotificationChannel } from "@/types/db";

export const metadata = { title: "Alerts" };

export default async function AlertsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);
  const db = createAdminClient();
  const { data } = await db.from("notification_channels").select("*").eq("org_id", org.id).order("created_at");
  const channels = (data ?? []) as NotificationChannel[];

  return (
    <div className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Alerts"
        eyebrow="Workspace"
        icon={<Bell className="h-4 w-4" />}
        description="Where we deliver detected change events."
      />

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
                <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))
        )}
      </Panel>

      <div className="grid gap-5 md:grid-cols-3">
        <ChannelCard icon={<Mail className="h-4 w-4" />} title="Email" description="Single inbox delivery via Resend.">
          <AddChannelForm type="email" submitLabel="Add email">
            <EmailChannelFields />
          </AddChannelForm>
        </ChannelCard>

        <ChannelCard icon={<MessageSquare className="h-4 w-4" />} title="Slack" description="Incoming webhook URL.">
          <AddChannelForm type="slack" submitLabel="Add Slack">
            <SlackChannelFields />
          </AddChannelForm>
        </ChannelCard>

        <ChannelCard icon={<Webhook className="h-4 w-4" />} title="Webhook" description="HMAC-signed POST. Team+.">
          <AddChannelForm type="webhook" submitLabel="Add webhook">
            <WebhookChannelFields />
          </AddChannelForm>
        </ChannelCard>
      </div>
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
