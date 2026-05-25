import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supa = await createClient();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url));
}
