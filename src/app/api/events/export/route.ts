import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { getOrgEvents } from "@/lib/queries";

export async function GET() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  if (org.plan !== "team" && org.plan !== "enterprise") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const events = await getOrgEvents(org.id, 1000);
  const header =
    "detected_at,type,confidence,is_public,summary,profile_name,profile_linkedin_url,profile_company,profile_title";
  const rows = events.map((e) =>
    [
      csvEscape(e.detected_at),
      csvEscape(e.type),
      String(e.confidence),
      e.is_public ? "true" : "false",
      csvEscape(e.summary ?? ""),
      csvEscape(e.profile?.full_name ?? ""),
      csvEscape(e.profile?.linkedin_url ?? ""),
      csvEscape(e.profile?.current_company ?? ""),
      csvEscape(e.profile?.current_title ?? ""),
    ].join(","),
  );

  const body = [header, ...rows].join("\n");
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="events.csv"',
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
