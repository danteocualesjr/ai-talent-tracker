import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }

  const form = await req.formData();
  const url = normalizeLinkedInUrl(String(form.get("linkedin_url") ?? ""));
  const email = String(form.get("email") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!url || !email) return NextResponse.json({ error: "missing" }, { status: 400 });

  const db = createAdminClient();
  const { data: profile, error: lookupError } = await db
    .from("profiles")
    .select("id")
    .eq("linkedin_url", url)
    .maybeSingle();
  if (lookupError) {
    console.error("[opt-out] lookup failed", lookupError);
    return NextResponse.json({ error: "request failed" }, { status: 500 });
  }
  if (!profile) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  const { error: updateError } = await db
    .from("profiles")
    .update({ is_opted_out: true })
    .eq("linkedin_url", url);
  if (updateError) {
    console.error("[opt-out] update failed", updateError);
    return NextResponse.json({ error: "request failed" }, { status: 500 });
  }

  await db.from("events").update({ is_public: false }).eq("profile_id", profile.id);

  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
