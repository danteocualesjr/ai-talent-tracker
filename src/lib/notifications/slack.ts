import "server-only";
import { NotificationDeliveryError } from "./errors";

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
}): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${payload.linkedinUrl}|${payload.name}>* — _${payload.type.replace(/_/g, " ")}_\n${payload.summary}`,
          },
        },
      ],
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new NotificationDeliveryError(`Slack webhook returned ${res.status}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }
}
