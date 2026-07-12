"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import type { ChannelType } from "@/types/db";

const EmailSchema = z.object({ to: z.string().email() });
const SlackSchema = z.object({ webhook_url: z.string().url().startsWith("https://hooks.slack.com/") });
const WebhookSchema = z.object({ url: z.string().url(), secret: z.string().optional() });

export type ActionResult = { ok: true } | { error: string };

export async function addChannel(formData: FormData): Promise<ActionResult> {
  const type = String(formData.get("type") ?? "") as ChannelType;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  let config: unknown;
  if (type === "email") {
    const r = EmailSchema.safeParse({ to: formData.get("to") });
    if (!r.success) return { error: "Enter a valid email address." };
    config = r.data;
  } else if (type === "slack") {
    if (org.plan === "free") {
      return { error: "Slack channels require a Pro plan or higher." };
    }
    const r = SlackSchema.safeParse({ webhook_url: formData.get("webhook_url") });
    if (!r.success) return { error: "Slack URL must start with https://hooks.slack.com/" };
    config = r.data;
  } else if (type === "webhook") {
    if (org.plan !== "team" && org.plan !== "enterprise") {
      return { error: "Webhook channels require a Team plan or higher." };
    }
    const r = WebhookSchema.safeParse({ url: formData.get("url"), secret: formData.get("secret") || undefined });
    if (!r.success) return { error: "Enter a valid webhook URL." };
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
  if (type === "email") return rows.some((row) => row.config.to === config.to);
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
