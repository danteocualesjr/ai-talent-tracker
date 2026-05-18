import { Bell, Mail, MessageSquare, Trash2, Webhook } from "lucide-react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
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

  return (
    <div className="container max-w-4xl space-y-8 py-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">Where we deliver detected change events.</p>
      </header>

      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-3 text-sm font-semibold">Active channels</div>
        {channels.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Bell className="h-6 w-6" />
            </div>
            <div className="font-medium">No channels yet</div>
            <p className="max-w-sm text-sm text-muted-foreground">
              Add at least one channel below so we can deliver alerts when a tracked profile changes.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {channels.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <ChannelIcon type={c.type} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{describeChannel(c)}</span>
                      <Badge variant="secondary" className="uppercase">{c.type}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Triggers on: {c.event_types.join(", ")}
                    </p>
                  </div>
                </div>
                <form action={removeChannel}>
                  <input type="hidden" name="id" value={c.id} />
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ChannelCard icon={<Mail className="h-4 w-4" />} title="Email" description="Single inbox delivery via Resend.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="email" />
            <div className="space-y-1.5">
              <Label htmlFor="to" className="text-xs">Email</Label>
              <Input id="to" name="to" type="email" required placeholder="alerts@you.com" />
            </div>
            <Button type="submit" className="w-full" size="sm">Add email</Button>
          </form>
        </ChannelCard>

        <ChannelCard icon={<MessageSquare className="h-4 w-4" />} title="Slack" description="Incoming webhook URL.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="slack" />
            <div className="space-y-1.5">
              <Label htmlFor="webhook_url" className="text-xs">Webhook URL</Label>
              <Input id="webhook_url" name="webhook_url" type="url" required placeholder="https://hooks.slack.com/..." />
            </div>
            <Button type="submit" className="w-full" size="sm">Add Slack</Button>
          </form>
        </ChannelCard>

        <ChannelCard icon={<Webhook className="h-4 w-4" />} title="Webhook" description="HMAC-signed POST. Team+.">
          <form action={addChannel} className="space-y-3">
            <input type="hidden" name="type" value="webhook" />
            <div className="space-y-1.5">
              <Label htmlFor="url" className="text-xs">URL</Label>
              <Input id="url" name="url" type="url" required placeholder="https://api.you.com/events" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secret" className="text-xs">Secret (optional)</Label>
              <Input id="secret" name="secret" type="text" placeholder="signing secret" />
            </div>
            <Button type="submit" className="w-full" size="sm">Add webhook</Button>
          </form>
        </ChannelCard>
      </div>
    </div>
  );
}

function ChannelCard({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">{icon}</div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ChannelIcon({ type }: { type: string }) {
  const icon = type === "email" ? <Mail className="h-4 w-4" /> : type === "slack" ? <MessageSquare className="h-4 w-4" /> : <Webhook className="h-4 w-4" />;
  return <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">{icon}</div>;
}

function describeChannel(c: NotificationChannel): string {
  const cfg = c.config as Record<string, unknown>;
  if (c.type === "email") return String(cfg.to ?? "");
  if (c.type === "slack") return String(cfg.webhook_url ?? "").replace(/\/services\/.*/, "/services/…");
  if (c.type === "webhook") return String(cfg.url ?? "");
  return "";
}
