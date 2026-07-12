import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";

export async function GET() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  if (org.plan !== "team" && org.plan !== "enterprise") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const profiles = await listOrgProfiles(org.id);
  const header = "full_name,linkedin_url,status,current_company,current_title,headline,last_synced_at";
  const rows = profiles.map((p) =>
    [
      csvEscape(p.full_name ?? ""),
      csvEscape(p.linkedin_url),
      csvEscape(p.status),
      csvEscape(p.current_company ?? ""),
      csvEscape(p.current_title ?? ""),
      csvEscape(p.headline ?? ""),
      csvEscape(p.last_synced_at ?? ""),
    ].join(","),
  );

  const body = [header, ...rows].join("\n");
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="watchlist.csv"',
    },
  });
}

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
