import { NextRequest, NextResponse } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const url = normalizeLinkedInUrl(String(form.get("linkedin_url") ?? ""));
  const email = String(form.get("email") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!url || !email) return NextResponse.json({ error: "missing" }, { status: 400 });

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("profiles")
    .update({ is_opted_out: true })
    .eq("linkedin_url", url)
    .select("id");
  if (error) return NextResponse.json({ error: "update failed" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "profile not found" }, { status: 404 });

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
