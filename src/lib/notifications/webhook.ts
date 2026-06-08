import "server-only";
import { createHmac } from "node:crypto";

function isBlockedWebhookUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return true;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost")) return true;
    if (host === "127.0.0.1" || host === "0.0.0.0" || host === "::1") return true;
    if (host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("169.254.")) return true;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true;
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
  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) throw new Error(`Webhook returned ${res.status}`);
}
