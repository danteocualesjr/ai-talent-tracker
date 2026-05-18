import { getPublicEvents } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

export async function GET() {
  const events = await getPublicEvents(50);
  const items = events.map((e) => {
    const link = `${siteUrl()}/feed/${e.id}`;
    return `
      <item>
        <title><![CDATA[${e.profile.full_name || e.profile.linkedin_handle} — ${e.type.replace(/_/g, " ")}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(e.detected_at).toUTCString()}</pubDate>
        <description><![CDATA[${e.summary}]]></description>
      </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Talent Tracker — Departures</title>
    <link>${siteUrl()}/feed</link>
    <description>Real-time AI lab departures, stealth flips, and founding signals.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
