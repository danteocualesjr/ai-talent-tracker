import "server-only";
import { shortLabelForEventType } from "@/lib/event-labels";
import { formatConfidenceLabel } from "@/lib/utils";
import type { EventType } from "@/types/db";

/** Slack usually answers in well under a second; do not hang the dispatch loop. */
const SLACK_TIMEOUT_MS = 10_000;

/** Escape characters that break Slack mrkdwn links or emphasis. */
function escapeMrkdwn(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function assertHttpsSlackWebhook(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Slack webhook URL is invalid");
  }
  if (parsed.protocol !== "https:") {
    throw new Error("Slack webhook URL must use HTTPS");
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === "https:" || protocol === "http:";
  } catch {
    return false;
  }
}

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
  detectedAt?: string;
  confidence?: number;
}): Promise<void> {
  assertHttpsSlackWebhook(webhookUrl);
  const typeLabel = shortLabelForEventType(payload.type as EventType);
  const safeName = escapeMrkdwn(payload.name);
  const safeSummary = escapeMrkdwn(payload.summary);
  // Strip characters that break Slack mrkdwn link targets, and only link
  // http(s) URLs so a malformed stored value never becomes a clickable target.
  const safeLinkedInUrl = isHttpUrl(payload.linkedinUrl) ? payload.linkedinUrl.replace(/[<>|]/g, "") : null;
  const metaParts: string[] = [];
  if (payload.detectedAt) metaParts.push(escapeMrkdwn(payload.detectedAt));
  if (typeof payload.confidence === "number" && Number.isFinite(payload.confidence)) {
    metaParts.push(escapeMrkdwn(formatConfidenceLabel(payload.confidence)));
  }
  const metaLine = metaParts.length ? `\n_${metaParts.join(" · ")}_` : "";
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(SLACK_TIMEOUT_MS),
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${safeLinkedInUrl ? `*<${safeLinkedInUrl}|${safeName}>*` : `*${safeName}*`} - _${typeLabel}_\n${safeSummary}${metaLine}`,
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = (await res.text().catch(() => "")).slice(0, 200);
    throw new Error(`Slack webhook failed (${res.status}): ${body}`);
  }
}
