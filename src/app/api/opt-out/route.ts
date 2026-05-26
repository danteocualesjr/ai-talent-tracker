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
  const { data, error } = await db
    .from("profiles")
    .update({ is_opted_out: true })
    .eq("linkedin_url", url)
    .select("id");

  if (error) {
    console.error("[opt-out]", error);
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }
  if (!data?.length) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  console.log("[opt-out] received", { url, email, notes });

  return NextResponse.json({ ok: true });
}
