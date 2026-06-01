import "server-only";
import { createHmac } from "node:crypto";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  assertSafeWebhookUrl(url);
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-tracker-signature"] = `sha256=${sig}`;
  }
  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    throw new Error(`Webhook delivery failed: ${res.status} ${res.statusText}`);
  }
}

function assertSafeWebhookUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid webhook URL");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Webhook URL must use HTTPS");
  }
  const host = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTS.has(host) || host.endsWith(".localhost")) {
    throw new Error("Webhook URL host not allowed");
  }
  if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(host)) {
    throw new Error("Webhook URL host not allowed");
  }
}
