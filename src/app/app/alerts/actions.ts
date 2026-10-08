"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { sendTestAlert } from "@/lib/notifications/dispatch";
import { EVENT_TYPE_LABELS } from "@/lib/event-labels";
import type { ChannelType, EventType, NotificationChannel } from "@/types/db";

const EmailSchema = z.object({ to: z.string().email() });
const SlackSchema = z.object({ webhook_url: z.string().url().startsWith("https://hooks.slack.com/") });
// Delivery refuses non-HTTPS endpoints, so reject them here instead of saving a
// channel that can only ever fail.
const WebhookSchema = z.object({ url: z.string().url().startsWith("https://"), secret: z.string().max(256).optional() });

export type ActionResult = { ok: true } | { error: string };

/** Plan gate shared by adding a channel and turning one back on. */
function planChannelError(plan: string, type: ChannelType): string | null {
  if (type === "slack" && plan === "free") return "Slack channels require a Pro plan or higher.";
  if (type === "webhook" && plan !== "team" && plan !== "enterprise") {
    return "Webhook channels require a Team plan or higher.";
  }
  return null;
}

export async function addChannel(formData: FormData): Promise<ActionResult> {
  const type = String(formData.get("type") ?? "") as ChannelType;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  let config: unknown;
  if (type === "email") {
    const r = EmailSchema.safeParse({ to: String(formData.get("to") ?? "").trim().toLowerCase() });
    if (!r.success) return { error: "Enter a valid email address." };
    config = r.data;
  } else if (type === "slack") {
    const planError = planChannelError(org.plan, type);
    if (planError) return { error: planError };
    const r = SlackSchema.safeParse({ webhook_url: String(formData.get("webhook_url") ?? "").trim() });
    if (!r.success) return { error: "Slack URL must start with https://hooks.slack.com/" };
    config = r.data;
  } else if (type === "webhook") {
    const planError = planChannelError(org.plan, type);
    if (planError) return { error: planError };
    const secretRaw = String(formData.get("secret") ?? "").trim();
    const r = WebhookSchema.safeParse({
      url: String(formData.get("url") ?? "").trim(),
      secret: secretRaw || undefined,
    });
    if (!r.success) return { error: "Enter a valid https:// webhook URL and a secret of at most 256 characters." };
    config = r.data;
  } else {
    return { error: "Unknown channel type." };
  }

  if (await channelExists(db, org.id, type, config as Record<string, unknown>)) {
    return { error: "This channel is already configured." };
  }

  const { error } = await db.from("notification_channels").insert({ org_id: org.id, type, config: config as object });
  if (error) return { error: "Could not add channel. Try again." };

  revalidatePath("/app/alerts");
  return { ok: true };
}

async function channelExists(
  db: ReturnType<typeof createAdminClient>,
  orgId: string,
  type: ChannelType,
  config: Record<string, unknown>,
): Promise<boolean> {
  const { data } = await db.from("notification_channels").select("id, config").eq("org_id", orgId).eq("type", type);
  const rows = (data ?? []) as { id: string; config: Record<string, unknown> }[];
  if (type === "email") return rows.some((row) => String(row.config.to ?? "").toLowerCase() === String(config.to ?? "").toLowerCase());
  if (type === "slack") return rows.some((row) => row.config.webhook_url === config.webhook_url);
  if (type === "webhook") return rows.some((row) => row.config.url === config.url);
  return false;
}

export async function removeChannel(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing channel id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { error } = await db.from("notification_channels").delete().eq("id", id).eq("org_id", org.id);
  if (error) return { error: "Could not remove channel. Try again." };

  revalidatePath("/app/alerts");
  return { ok: true };
}

export async function toggleChannelActive(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const isActive = formData.get("is_active") === "true";
  if (!id) return { error: "Missing channel id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  // After a downgrade, re-enabling a Slack or webhook channel must respect the plan.
  if (isActive) {
    const { data: channel } = await db
      .from("notification_channels")
      .select("type")
      .eq("id", id)
      .eq("org_id", org.id)
      .maybeSingle();
    if (!channel) return { error: "Channel not found." };
    const planError = planChannelError(org.plan, channel.type as ChannelType);
    if (planError) return { error: planError };
  }

  const { error } = await db
    .from("notification_channels")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("org_id", org.id);
  if (error) return { error: "Could not update channel. Try again." };

  revalidatePath("/app/alerts");
  return { ok: true };
}

// Derived from the label map so a new event type cannot be forgotten here.
const VALID_EVENT_TYPES = new Set<string>(Object.keys(EVENT_TYPE_LABELS));

export async function updateChannelEventTypes(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("event_types") ?? "[]");
  if (!id) return { error: "Missing channel id." };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "Invalid event types." };
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { error: "Select at least one event type." };
  }
  const eventTypes = [...new Set(parsed.filter((t): t is EventType => typeof t === "string" && VALID_EVENT_TYPES.has(t)))];
  if (eventTypes.length === 0) return { error: "Select at least one valid event type." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { error } = await db
    .from("notification_channels")
    .update({ event_types: eventTypes })
    .eq("id", id)
    .eq("org_id", org.id);
  if (error) return { error: "Could not update event types. Try again." };

  revalidatePath("/app/alerts");
  return { ok: true };
}

export async function sendTestAlertAction(formData: FormData): Promise<ActionResult> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing channel id." };

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  const { data: channel, error: fetchErr } = await db
    .from("notification_channels")
    .select("*")
    .eq("id", id)
    .eq("org_id", org.id)
    .maybeSingle();
  if (fetchErr || !channel) return { error: "Channel not found." };

  try {
    await sendTestAlert(channel as NotificationChannel);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Test alert failed." };
  }

  return { ok: true };
}
