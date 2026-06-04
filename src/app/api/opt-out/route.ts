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
  const { data: updated } = await db
    .from("profiles")
    .update({ is_opted_out: true, next_sync_at: null })
    .eq("linkedin_url", url)
    .select("id");

  if (!updated?.length) {
    return NextResponse.json({ ok: false, error: "profile not found" }, { status: 404 });
  }

  const profileId = updated[0].id as string;
  await db.from("profile_snapshots").delete().eq("profile_id", profileId);
  await db.from("watchlist_profiles").delete().eq("profile_id", profileId);

  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
