import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { listOrgProfiles } from "@/lib/queries";

export async function GET(request: Request) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const profiles = await listOrgProfiles(org.id);

  const filtered = q
    ? profiles.filter((p) =>
        [p.full_name, p.linkedin_handle, p.current_company, p.headline]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : profiles.slice(0, 8);

  return NextResponse.json({
    profiles: filtered.slice(0, 8).map((p) => ({
      id: p.id,
      name: p.full_name || p.linkedin_handle || "Profile",
      company: p.current_company,
      href: `/app/profiles/${p.id}`,
    })),
  });
}
