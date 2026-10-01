import "server-only";
import { createHmac } from "node:crypto";

/** Give up on slow receivers so one stuck endpoint cannot stall the dispatch loop. */
const WEBHOOK_TIMEOUT_MS = 10_000;

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (secret) {
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    headers["x-tracker-signature"] = `sha256=${sig}`;
  }
  const res = await fetch(url, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
  });
  if (!res.ok) {
    const text = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`Webhook delivery failed (${res.status}): ${text}`);
  }
}
