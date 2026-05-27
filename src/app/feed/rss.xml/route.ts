import { getPublicEvents } from "@/lib/queries";
import { siteUrl } from "@/lib/utils";

export const revalidate = 300;

function cdata(value: string): string {
  return value.replace(/]]>/g, "]]]]><![CDATA[>");
}

export async function GET() {
  const events = await getPublicEvents(50);
  const items = events.map((e) => {
    const link = `${siteUrl()}/feed/${e.id}`;
    const title = cdata(`${e.profile.full_name || e.profile.linkedin_handle} — ${e.type.replace(/_/g, " ")}`);
    const description = cdata(e.summary);
    return `
      <item>
        <title><![CDATA[${title}]]></title>
        <link>${link}</link>
        <guid>${link}</guid>
        <pubDate>${new Date(e.detected_at).toUTCString()}</pubDate>
        <description><![CDATA[${description}]]></description>
      </item>`;
  }).join("");

  const lastBuild = events[0]?.detected_at
    ? new Date(events[0].detected_at).toUTCString()
    : new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AI Talent Tracker — Departures</title>
    <link>${siteUrl()}/feed</link>
    <description>Real-time AI lab departures, stealth flips, and founding signals.</description>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <ttl>5</ttl>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
