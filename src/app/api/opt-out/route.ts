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
  const { data: profile, error: lookupErr } = await db
    .from("profiles")
    .select("id")
    .eq("linkedin_url", url)
    .maybeSingle();
  if (lookupErr) return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  if (!profile) return NextResponse.json({ error: "profile not found" }, { status: 404 });

  const { error } = await db
    .from("profiles")
    .update({ is_opted_out: true, next_sync_at: null })
    .eq("id", profile.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await db.from("events").update({ is_public: false }).eq("profile_id", profile.id);
  await db.from("watchlist_profiles").delete().eq("profile_id", profile.id);

  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
