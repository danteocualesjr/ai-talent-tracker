import "server-only";

export async function sendSlack(webhookUrl: string, payload: {
  name: string;
  summary: string;
  type: string;
  linkedinUrl: string;
}): Promise<void> {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${escapeSlackUrl(payload.linkedinUrl)}|${escapeSlackMrkdwn(payload.name)}>* — _${escapeSlackMrkdwn(payload.type.replace(/_/g, " "))}_\n${escapeSlackMrkdwn(payload.summary)}`,
          },
        },
      ],
    }),
  });
}

function escapeSlackMrkdwn(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

function escapeSlackUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" || !u.hostname.includes("linkedin.com")) return "https://www.linkedin.com";
    return u.href.replace(/[|<>]/g, "");
  } catch {
    return "https://www.linkedin.com";
  }
}
