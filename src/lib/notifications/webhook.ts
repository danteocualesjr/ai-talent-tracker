import "server-only";
import { createHmac } from "node:crypto";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export function isBlockedWebhookUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return true;
    const host = u.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(host)) return true;
    if (host.endsWith(".local")) return true;
    if (/^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) return true;
    return false;
  } catch {
    return true;
  }
}

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  if (isBlockedWebhookUrl(url)) throw new Error("Webhook URL is not allowed");

  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-tracker-signature"] = `sha256=${sig}`;
  }
  const res = await fetch(url, { method: "POST", headers, body, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`Webhook delivery failed: ${res.status}`);
}
