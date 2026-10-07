import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { humanizeLinkedInHandle } from "@/lib/utils";
import { renderEventEmail, sendEventEmail } from "./email";
import { sendSlack } from "./slack";
import { sendWebhook } from "./webhook";
import type { DeliveryStatus, EventRow, NotificationChannel, Profile } from "@/types/db";

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
  // Someone who opted out after the event was detected should not be alerted on.
  if (profile.is_opted_out) return { dispatched: 0 };

  // Find every org watching this profile.
  const { data: watchers, error: watchersErr } = await db
    .from("watchlist_profiles")
    .select("watchlist_id, watchlists(org_id)")
    .eq("profile_id", profile.id);
  // Throw so notify-event retries instead of silently dropping the alert.
  if (watchersErr) throw watchersErr;

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

  const { data: channels, error: channelsErr } = await db
    .from("notification_channels")
    .select("*")
    .in("org_id", orgIds)
    .eq("is_active", true);
  if (channelsErr) throw channelsErr;

  // notify-event retries; never send the same alert twice to a channel.
  const { data: priorSends, error: priorErr } = await db
    .from("notification_deliveries")
    .select("channel_id")
    .eq("event_id", event.id)
    .eq("status", "sent");
  // Without the prior-send list a retry could double-send, so retry the whole step.
  if (priorErr) throw priorErr;
  const alreadySent = new Set(((priorSends ?? []) as { channel_id: string }[]).map((d) => d.channel_id));

  let dispatched = 0;
  for (const ch of (channels ?? []) as NotificationChannel[]) {
    // A channel saved without event types subscribes to nothing rather than crashing the loop.
    if (!(ch.event_types ?? []).includes(event.type)) continue;
    if (alreadySent.has(ch.id)) continue;

    try {
      const status = await deliver(ch, event, profile);
      await db.from("notification_deliveries").insert({
        channel_id: ch.id,
        event_id: event.id,
        status,
        delivered_at: status === "sent" ? new Date().toISOString() : null,
        error: status === "skipped" ? "Email is not configured (RESEND_API_KEY missing)." : null,
      });
      if (status === "sent") dispatched++;
    } catch (e) {
      await db.from("notification_deliveries").insert({
        channel_id: ch.id,
        event_id: event.id,
        status: "failed",
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return { dispatched };
}

/** Sends a synthetic test alert through a single channel (no DB event required). */
export async function sendTestAlert(channel: NotificationChannel): Promise<void> {
  const testEvent: EventRow = {
    id: "test",
    profile_id: "test",
    type: "went_stealth",
    confidence: 1,
    summary: "This is a test alert from AI Talent Tracker. Your channel is configured correctly.",
    before: null,
    after: null,
    detected_at: new Date().toISOString(),
    is_public: false,
  };
  const testProfile: Profile = {
    id: "test",
    linkedin_url: "https://www.linkedin.com/in/test-profile",
    linkedin_handle: "test-profile",
    full_name: "Test Profile",
    headline: "Building something new",
    current_company: null,
    current_company_lab_id: null,
    current_title: null,
    location: null,
    avatar_url: null,
    github_handle: null,
    github_last_commit_at: null,
    github_commits_30d: null,
    x_handle: null,
    about: null,
    status: "stealth",
    last_synced_at: null,
    next_sync_at: null,
    is_opted_out: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const status = await deliver(channel, testEvent, testProfile);
  if (status === "skipped") {
    throw new Error("Email alerts are not configured on this server yet (RESEND_API_KEY is missing).");
  }
}

async function deliver(
  ch: NotificationChannel,
  event: EventRow,
  profile: Profile,
): Promise<Extract<DeliveryStatus, "sent" | "skipped">> {
  const payload = {
    // A readable name from the handle beats a raw URL in alert subjects and Slack.
    name: profile.full_name || humanizeLinkedInHandle(profile.linkedin_handle) || profile.linkedin_url,
    summary: event.summary,
    type: event.type,
    linkedinUrl: profile.linkedin_url,
    detectedAt: new Date(event.detected_at).toUTCString(),
    confidence: event.confidence,
  };

  if (ch.type === "email") {
    const cfg = ch.config as unknown as EmailConfig;
    const { subject, html } = renderEventEmail(payload);
    return (await sendEventEmail(cfg.to, subject, html)) ? "sent" : "skipped";
  }
  if (ch.type === "slack") {
    const cfg = ch.config as unknown as SlackConfig;
    await sendSlack(cfg.webhook_url, payload);
    return "sent";
  }
  if (ch.type === "webhook") {
    const cfg = ch.config as unknown as WebhookConfig;
    await sendWebhook(cfg.url, cfg.secret, {
      event_id: event.id,
      profile_id: profile.id,
      ...payload,
      // Machine-readable fields alongside the human-friendly ones above.
      detected_at: new Date(event.detected_at).toISOString(),
      confidence: event.confidence,
    });
    return "sent";
  }
  throw new Error(`Unsupported channel type: ${String(ch.type)}`);
}
