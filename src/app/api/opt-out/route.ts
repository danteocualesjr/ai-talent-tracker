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
  const { data: profile } = await db.from("profiles").select("id").eq("linkedin_url", url).maybeSingle();
  if (!profile) {
    // Only tracked profiles can be opted out; prevents arbitrary URL abuse.
    console.log("[opt-out] no profile for url", { url, email, notes });
    return NextResponse.json({ ok: true });
  }

  await db.from("profiles").update({ is_opted_out: true }).eq("id", profile.id);
  await db.from("watchlist_profiles").delete().eq("profile_id", profile.id);

  console.log("[opt-out] applied", { url, email, notes, profile_id: profile.id });

  return NextResponse.json({ ok: true });
}
