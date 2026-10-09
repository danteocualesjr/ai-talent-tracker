import "server-only";
import { createHash } from "node:crypto";
import { DIFFED_FIELDS } from "./diff";
import type { ProviderProfile } from "./providers/types";

/**
 * Stable hash of the diffed profile fields. Kept out of diff.ts because the
 * client-side snapshot list imports diffProfiles, and pulling node:crypto into
 * that bundle broke `next build`.
 */
export function hashSnapshot(p: ProviderProfile): string {
  const subset: Record<string, unknown> = {};
  for (const f of DIFFED_FIELDS) subset[f] = p[f];
  return createHash("sha256").update(JSON.stringify(subset)).digest("hex");
}
