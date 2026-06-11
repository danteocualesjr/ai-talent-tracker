import "server-only";

function escapeSlackMrkdwn(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
}): Promise<void> {
  const name = escapeSlackMrkdwn(payload.name);
  const summary = escapeSlackMrkdwn(payload.summary);
  const type = escapeSlackMrkdwn(payload.type.replace(/_/g, " "));
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${payload.linkedinUrl}|${name}>* — _${type}_\n${summary}`,
          },
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`slack delivery failed: ${res.status}`);
}
