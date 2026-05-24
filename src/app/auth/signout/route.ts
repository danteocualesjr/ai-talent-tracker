import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supa = await createClient();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
