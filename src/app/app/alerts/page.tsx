import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { addChannel, removeChannel } from "./actions";
import { Trash2 } from "lucide-react";
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
    <div className="container max-w-3xl space-y-6 py-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-sm text-muted-foreground">Where we deliver detected change events.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active channels</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {channels.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">No channels yet.</div>
          ) : channels.map((c) => (
            <div key={c.id} className="flex items-center justify-between py-3">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase">{c.type}</Badge>
                  <span className="text-sm">{describeChannel(c)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Triggers on: {c.event_types.join(", ")}
                </p>
              </div>
              <form action={removeChannel}>
                <input type="hidden" name="id" value={c.id} />
                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Email</CardTitle>
            <CardDescription>Send alerts to a single inbox.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addChannel} className="space-y-3">
              <input type="hidden" name="type" value="email" />
              <Label htmlFor="to">Email</Label>
              <Input id="to" name="to" type="email" required placeholder="alerts@you.com" />
              <Button type="submit" className="w-full">Add email</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Slack</CardTitle>
            <CardDescription>Use an incoming-webhook URL.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addChannel} className="space-y-3">
              <input type="hidden" name="type" value="slack" />
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input id="webhook_url" name="webhook_url" type="url" required placeholder="https://hooks.slack.com/..." />
              <Button type="submit" className="w-full">Add Slack</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Webhook</CardTitle>
            <CardDescription>HMAC-signed POST. Team plan and up.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addChannel} className="space-y-3">
              <input type="hidden" name="type" value="webhook" />
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" type="url" required placeholder="https://api.you.com/events" />
              <Label htmlFor="secret">Secret (optional)</Label>
              <Input id="secret" name="secret" type="text" placeholder="signing secret" />
              <Button type="submit" className="w-full">Add webhook</Button>
            </form>
          </CardContent>
        </Card>
      </div>
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
