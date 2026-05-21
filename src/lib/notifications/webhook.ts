import "server-only";
import { createHmac } from "node:crypto";
import { isSafeWebhookUrl } from "@/lib/utils";

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  if (!isSafeWebhookUrl(url)) throw new Error("Webhook URL is not allowed");
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-tracker-signature"] = `sha256=${sig}`;
  }
  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
}
