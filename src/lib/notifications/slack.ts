import "server-only";

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
    const text = await res.text().catch(() => "");
    throw new Error(`Slack webhook failed (${res.status}): ${text.slice(0, 200)}`);
  }
}
