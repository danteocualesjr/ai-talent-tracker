/**
 * Seed a starter roster for OpenAI as the marketing hook.
 * Run with: `pnpm tsx scripts/seed-labs.ts` or `npm run seed`
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.
 *
 * The hand-curated list below is intentionally small. To bootstrap a full
 * roster, swap in a Proxycurl "employee listing" call or a CSV import.
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Tiny .env loader so we don't pull in dotenv as a dep just for this script.
for (const path of [".env.local", ".env"]) {
  try {
    const txt = readFileSync(path, "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, "");
    }
  } catch { /* file missing is fine */ }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Public LinkedIn URLs only. These are illustrative seed entries; replace with
// your real curated roster (or import via Proxycurl employee-listing API).
const ROSTER: Record<string, string[]> = {
  openai: [
    // "https://www.linkedin.com/in/sama",
  ],
  anthropic: [],
  deepmind: [],
};

async function main() {
  const { data: labs, error } = await db.from("labs").select("id,slug");
  if (error) throw error;
  const bySlug = new Map(labs!.map((l) => [l.slug, l.id]));

  let inserted = 0;
  for (const [slug, urls] of Object.entries(ROSTER)) {
    const labId = bySlug.get(slug);
    if (!labId) {
      console.warn(`Lab ${slug} not found, skipping`);
      continue;
    }
    for (const url of urls) {
      const { error: insErr } = await db
        .from("profiles")
        .upsert({ linkedin_url: url, current_company_lab_id: labId }, { onConflict: "linkedin_url" });
      if (insErr) console.error(insErr);
      else inserted++;
    }
  }
  console.log(`Seeded ${inserted} profiles`);
}

main().catch((e) => { console.error(e); process.exit(1); });
