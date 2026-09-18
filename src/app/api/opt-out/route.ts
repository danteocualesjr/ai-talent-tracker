import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeLinkedInUrl } from "@/lib/utils";

const EmailSchema = z.string().email();

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const url = normalizeLinkedInUrl(String(form.get("linkedin_url") ?? ""));
  const emailParsed = EmailSchema.safeParse(String(form.get("email") ?? "").trim());
  const notes = String(form.get("notes") ?? "");
  if (!url || !emailParsed.success) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  const db = createAdminClient();
  // Upsert so opt-out persists even when the profile is not yet indexed.
  const { error } = await db.from("profiles").upsert(
    { linkedin_url: url, is_opted_out: true },
    { onConflict: "linkedin_url" },
  );
  if (error) {
    console.error("[opt-out] upsert failed", error);
    return NextResponse.json({ error: "could not save opt-out" }, { status: 500 });
  }

  // Avoid logging email/notes (PII). Hosted email fan-out can be wired later.
  if (process.env.NODE_ENV !== "production") {
    console.info("[opt-out] saved", { handle: url.split("/in/")[1] ?? "unknown" });
  }

  return NextResponse.json({ ok: true });
}
