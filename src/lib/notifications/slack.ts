import "server-only";
import { shortLabelForEventType } from "@/lib/event-labels";
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

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
  detectedAt?: string;
  confidence?: number;
}): Promise<void> {
  const typeLabel = shortLabelForEventType(payload.type as EventType);
  const safeName = escapeMrkdwn(payload.name);
  const safeSummary = escapeMrkdwn(payload.summary);
  const metaParts: string[] = [];
  if (payload.detectedAt) metaParts.push(escapeMrkdwn(payload.detectedAt));
  if (typeof payload.confidence === "number" && Number.isFinite(payload.confidence)) {
    metaParts.push(`${Math.max(0, Math.min(100, Math.round(payload.confidence * 100)))}% confidence`);
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
            text: `*<${payload.linkedinUrl}|${safeName}>* - _${typeLabel}_\n${safeSummary}${metaLine}`,
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
