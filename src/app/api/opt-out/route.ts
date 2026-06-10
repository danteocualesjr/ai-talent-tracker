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
  if (!profile) return NextResponse.json({ error: "profile not found" }, { status: 404 });

  const profileId = (profile as { id: string }).id;
  await db.from("profiles").update({ is_opted_out: true }).eq("id", profileId);
  await db.from("profile_snapshots").delete().eq("profile_id", profileId);
  await db.from("events").update({ is_public: false }).eq("profile_id", profileId);
  await db.from("watchlist_profiles").delete().eq("profile_id", profileId);

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { url, email, notes, profileId });

  return NextResponse.json({ ok: true });
}
