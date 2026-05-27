import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { renderEventEmail, sendEventEmail } from "./email";
import { sendSlack } from "./slack";
import { sendWebhook } from "./webhook";
import type { EventRow, NotificationChannel, Profile } from "@/types/db";

interface EmailConfig { to: string }
interface SlackConfig { webhook_url: string }
interface WebhookConfig { url: string; secret?: string }

export async function dispatchEvent(eventId: string): Promise<{ dispatched: number }> {
  const db = createAdminClient();
  const { data: ev, error: evErr } = await db.from("events").select("*").eq("id", eventId).single();
  if (evErr || !ev) throw evErr ?? new Error("event not found");
  const event = ev as EventRow;

  const { data: prof, error: profErr } = await db.from("profiles").select("*").eq("id", event.profile_id).single();
  if (profErr || !prof) throw profErr ?? new Error("profile not found");
  const profile = prof as Profile;

  // Find every org watching this profile.
  const { data: watchers } = await db
    .from("watchlist_profiles")
    .select("watchlist_id, watchlists(org_id)")
    .eq("profile_id", profile.id);

  const orgIds = Array.from(
    new Set(
      ((watchers ?? []) as Array<{ watchlists?: { org_id?: string } | { org_id?: string }[] | null }>)
        .map((w) => {
          const wl = w.watchlists;
          if (!wl) return undefined;
          if (Array.isArray(wl)) return wl[0]?.org_id;
          return wl.org_id;
        })
        .filter((x): x is string => Boolean(x)),
    ),
  );
  if (orgIds.length === 0) return { dispatched: 0 };

  const { data: channels } = await db
    .from("notification_channels")
    .select("*")
    .in("org_id", orgIds)
    .eq("is_active", true);

  let dispatched = 0;
  for (const ch of (channels ?? []) as NotificationChannel[]) {
    if (!ch.event_types.includes(event.type)) continue;

    const { data: priorSent } = await db
      .from("notification_deliveries")
      .select("id")
      .eq("channel_id", ch.id)
      .eq("event_id", event.id)
      .eq("status", "sent")
      .maybeSingle();
    if (priorSent) continue;

    try {
      await deliver(ch, event, profile);
      const { error: sentErr } = await db.from("notification_deliveries").insert({
        channel_id: ch.id,
        event_id: event.id,
        status: "sent",
        delivered_at: new Date().toISOString(),
      });
      if (sentErr) throw sentErr;
      dispatched++;
    } catch (e) {
      const { error: failErr } = await db.from("notification_deliveries").insert({
        channel_id: ch.id,
        event_id: event.id,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
      if (failErr) throw failErr;
      throw e;
    }
  }
  return { dispatched };
}

async function deliver(ch: NotificationChannel, event: EventRow, profile: Profile): Promise<void> {
  const payload = {
    name: profile.full_name || profile.linkedin_url,
    summary: event.summary,
    type: event.type,
    linkedinUrl: profile.linkedin_url,
    detectedAt: new Date(event.detected_at).toUTCString(),
  };

  if (ch.type === "email") {
    const cfg = ch.config as unknown as EmailConfig;
    const { subject, html } = renderEventEmail(payload);
    await sendEventEmail(cfg.to, subject, html);
    return;
  }
  if (ch.type === "slack") {
    const cfg = ch.config as unknown as SlackConfig;
    await sendSlack(cfg.webhook_url, payload);
    return;
  }
  if (ch.type === "webhook") {
    const cfg = ch.config as unknown as WebhookConfig;
    await sendWebhook(cfg.url, cfg.secret, {
      event_id: event.id,
      profile_id: profile.id,
      ...payload,
    });
    return;
  }
}
