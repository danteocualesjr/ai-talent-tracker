import { createHash } from "node:crypto";
import type { ProviderProfile } from "./providers/types";

export const DIFFED_FIELDS = [
  "full_name",
  "headline",
  "current_company",
  "current_title",
  "location",
  "about",
  "github_handle",
  "x_handle",
] as const;

export type DiffField = (typeof DIFFED_FIELDS)[number];

export interface FieldDiff {
  field: DiffField;
  before: string | null;
  after: string | null;
}

export function diffProfiles(prev: Partial<ProviderProfile> | null, next: ProviderProfile): FieldDiff[] {
  const out: FieldDiff[] = [];
  for (const field of DIFFED_FIELDS) {
    const before = (prev?.[field] ?? null) as string | null;
    const after = (next[field] ?? null) as string | null;
    if (norm(before) !== norm(after)) out.push({ field, before, after });
  }
  return out;
}

function norm(v: string | null | undefined): string {
  return (v ?? "").trim().toLowerCase();
}

export function hashSnapshot(p: ProviderProfile): string {
  const subset: Record<string, string> = {};
  for (const f of DIFFED_FIELDS) subset[f] = norm((p[f] ?? null) as string | null);
  return createHash("sha256").update(JSON.stringify(subset)).digest("hex");
}
