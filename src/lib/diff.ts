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
  // Collapse inner whitespace too, so "Jane  Doe" vs "Jane Doe" is not a change.
  return (v ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}
