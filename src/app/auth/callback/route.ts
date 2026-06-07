import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { safeRedirectPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeRedirectPath(url.searchParams.get("next") || "/app");

  if (!code) return NextResponse.redirect(new URL("/login", request.url));

  const supa = await createClient();
  const { error, data } = await supa.auth.exchangeCodeForSession(code);
  if (error || !data.user) {
    return NextResponse.redirect(new URL("/login?error=auth", request.url));
  }

  try {
    await ensureOrgForUser(data.user.id, data.user.email ?? null);
  } catch (e) {
    console.error("[auth/callback] org provisioning failed", e);
  }

  return NextResponse.redirect(new URL(next, request.url));
}
