import "server-only";
import { createHmac } from "node:crypto";

export function assertSafeWebhookUrl(urlStr: string): void {
  let u: URL;
  try {
    u = new URL(urlStr);
  } catch {
    throw new Error("Invalid webhook URL");
  }
  if (u.protocol !== "https:") throw new Error("Webhook URL must use HTTPS");
  const host = u.hostname.toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]" ||
    host === "0.0.0.0" ||
    host.startsWith("169.254.") ||
    host.startsWith("10.") ||
    host.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    throw new Error("Webhook URL targets a private or local address");
  }
}

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  assertSafeWebhookUrl(url);
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-tracker-signature"] = `sha256=${sig}`;
  }
  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Webhook delivery failed (${res.status})`);
}
