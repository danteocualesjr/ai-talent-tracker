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
  const { data: profile } = await db.from("profiles").select("id, is_opted_out").eq("linkedin_url", url).maybeSingle();
  if (profile && !profile.is_opted_out) {
    await db.from("profiles").update({ is_opted_out: true }).eq("id", profile.id);
    console.log("[opt-out] applied", { url, email, notes });
  } else {
    console.log("[opt-out] received (no tracked profile)", { url, email, notes });
  }

  return NextResponse.json({ ok: true });
}
