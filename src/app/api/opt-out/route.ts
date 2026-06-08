import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid content type" }, { status: 415 });
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }

  const url = normalizeLinkedInUrl(String(form.get("linkedin_url") ?? ""));
  const email = String(form.get("email") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!url || !email) return NextResponse.json({ error: "missing" }, { status: 400 });

  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ is_opted_out: true }).eq("linkedin_url", url);
  if (error) {
    console.error("[opt-out] db error", error);
    return NextResponse.json({ error: "failed to process request" }, { status: 500 });
  }

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
