"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { assertSafeWebhookUrl } from "@/lib/webhook-url";
import type { ChannelType } from "@/types/db";

const EmailSchema = z.object({ to: z.string().email() });
const SlackSchema = z.object({ webhook_url: z.string().url().startsWith("https://hooks.slack.com/") });
const WebhookSchema = z.object({ url: z.string().url(), secret: z.string().optional() });

export async function addChannel(formData: FormData): Promise<void> {
  const type = String(formData.get("type") ?? "") as ChannelType;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return;
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();

  let config: unknown;
  if (type === "email") {
    const r = EmailSchema.safeParse({ to: formData.get("to") });
    if (!r.success) return;
    config = r.data;
  } else if (type === "slack") {
    const r = SlackSchema.safeParse({ webhook_url: formData.get("webhook_url") });
    if (!r.success) return;
    config = r.data;
  } else if (type === "webhook") {
    const r = WebhookSchema.safeParse({ url: formData.get("url"), secret: formData.get("secret") || undefined });
    if (!r.success) return;
    try {
      assertSafeWebhookUrl(r.data.url);
    } catch {
      return;
    }
    config = r.data;
  } else {
    return;
  }

  await db.from("notification_channels").insert({ org_id: org.id, type, config: config as object });
  revalidatePath("/app/alerts");
}

export async function removeChannel(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return;
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const db = createAdminClient();
  await db.from("notification_channels").delete().eq("id", id).eq("org_id", org.id);
  revalidatePath("/app/alerts");
}
