import "server-only";
import { createHmac } from "node:crypto";

/** Give up on slow receivers so one stuck endpoint cannot stall the dispatch loop. */
const WEBHOOK_TIMEOUT_MS = 10_000;

function assertHttpsUrl(url: string, label: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} URL is invalid`);
  }
  if (parsed.protocol !== "https:") {
    throw new Error(`${label} URL must use HTTPS`);
  }
}

export async function sendWebhook(url: string, secret: string | undefined, payload: object): Promise<void> {
  assertHttpsUrl(url, "Webhook");
  const body = JSON.stringify(payload);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    // Lets receivers allowlist or log tracker deliveries.
    "user-agent": "ai-talent-tracker-webhooks/1.0",
  };
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
