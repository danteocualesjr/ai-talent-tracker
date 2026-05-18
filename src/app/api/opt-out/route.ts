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
  await db.from("profiles").update({ is_opted_out: true }).eq("linkedin_url", url);

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
