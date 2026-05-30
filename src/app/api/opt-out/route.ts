import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const url = normalizeLinkedInUrl(String(form.get("linkedin_url") ?? ""));
  const email = String(form.get("email") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!url || !email) return NextResponse.json({ error: "missing" }, { status: 400 });

  const db = createAdminClient();
  const { data: profile, error: profileErr } = await db
    .from("profiles")
    .update({ is_opted_out: true })
    .eq("linkedin_url", url)
    .select("id")
    .maybeSingle();
  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "profile not found" }, { status: 404 });

  await db.from("profile_snapshots").delete().eq("profile_id", profile.id);
  await db.from("events").update({ is_public: false }).eq("profile_id", profile.id);

  console.log("[opt-out] received", { url, email, notes, profile_id: profile.id });

  return NextResponse.json({ ok: true });
}
