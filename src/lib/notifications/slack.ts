import "server-only";
import { shortLabelForEventType } from "@/lib/event-labels";
import type { EventType } from "@/types/db";

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
}): Promise<void> {
  const typeLabel = shortLabelForEventType(payload.type as EventType);
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${payload.linkedinUrl}|${payload.name}>* - _${typeLabel}_\n${payload.summary}`,
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
