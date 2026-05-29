import { NextRequest, NextResponse } from "next/server";
import { applyProfileOptOut } from "@/lib/privacy";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const linkedinUrl = String(form.get("linkedin_url") ?? "");
  const email = String(form.get("email") ?? "");
  const notes = String(form.get("notes") ?? "");
  if (!linkedinUrl || !email) return NextResponse.json({ error: "missing" }, { status: 400 });

  const result = await applyProfileOptOut(linkedinUrl);
  if (!result) return NextResponse.json({ error: "invalid linkedin url" }, { status: 400 });

  // In production, also email the team. Logged for now.
  console.log("[opt-out] received", { profileId: result.profileId, email, notes });

  return NextResponse.json({ ok: true });
}
