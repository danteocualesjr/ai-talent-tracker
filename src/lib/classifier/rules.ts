import type { DiffField, FieldDiff } from "@/lib/diff";
import type { EventType, ProfileStatus } from "@/types/db";

export interface ClassifiedEvent {
  type: EventType;
  confidence: number;
  summary: string;
  status?: ProfileStatus;
}

const STEALTH_PATTERNS = [
  /stealth/i,
  /building (?:something|the future)/i,
  /\bbuilding\b.*\b(ai|agi)\b/i,
  /undisclosed/i,
  /coming soon/i,
];

const FOUNDER_PATTERNS = [
  /\bfounder\b/i,
  /\bco-?founder\b/i,
  /\bceo\b.*\b(stealth|startup|s-1)\b/i,
];

const STAFF_FOUNDING_PATTERNS = [
  /founding (engineer|researcher|designer|product|gtm)/i,
];

const FIELD_LABELS: Record<DiffField, string> = {
  full_name: "name",
  headline: "headline",
  current_company: "company",
  current_title: "title",
  location: "location",
  about: "about",
  github_handle: "GitHub",
  x_handle: "X handle",
};

/**
 * Heuristics-only classifier. Cheap, deterministic. The LLM classifier in
 * llm.ts kicks in when this returns low confidence or `other`.
 */
export function classifyByRules(
  diffs: FieldDiff[],
  prev: { current_company: string | null; headline: string | null },
  next: { current_company: string | null; headline: string | null },
): ClassifiedEvent | null {
  if (diffs.length === 0) return null;

  const headline = next.headline ?? "";
  const companyChanged = diffs.some((d) => d.field === "current_company");
  const headlineChanged = diffs.some((d) => d.field === "headline");

  // Only read headline signals when the headline itself changed; otherwise an
  // existing "Stealth" or "Founder" headline re-fires on every unrelated edit.
  const headlineSignals = headlineChanged ? headline : "";

  for (const re of STEALTH_PATTERNS) {
    if (re.test(headlineSignals)) {
      return {
        type: "went_stealth",
        confidence: 0.9,
        status: "stealth",
        summary: `Headline now reads "${headline}" - stealth signal.`,
      };
    }
  }

  for (const re of FOUNDER_PATTERNS) {
    if (re.test(headlineSignals)) {
      return {
        type: "headline_signals_founding",
        confidence: 0.85,
        status: "founder",
        summary: `Headline now reads "${headline}" - founding signal.`,
      };
    }
  }

  for (const re of STAFF_FOUNDING_PATTERNS) {
    if (re.test(headlineSignals)) {
      return {
        type: "headline_signals_founding",
        confidence: 0.7,
        status: "founder",
        summary: `Headline now reads "${headline}" - founding-team signal.`,
      };
    }
  }

  if (companyChanged) {
    const left = prev.current_company;
    const joined = next.current_company;
    if (left && !joined) {
      return {
        type: "left_company",
        confidence: 0.8,
        status: "left",
        summary: `Left ${left}. Current company removed from profile.`,
      };
    }
    if (left && joined && norm(left) !== norm(joined)) {
      return {
        type: "joined_company",
        confidence: 0.75,
        status: "active",
        summary: `Moved from ${left} to ${joined}.`,
      };
    }
    if (!left && joined) {
      return {
        type: "joined_company",
        confidence: 0.6,
        status: "active",
        summary: `Joined ${joined}.`,
      };
    }
  }

  if (headlineChanged) {
    return {
      type: "role_change_internal",
      confidence: 0.5,
      summary: `Headline changed to "${headline}".`,
    };
  }

  const titleDiff = diffs.find((d) => d.field === "current_title");
  if (titleDiff) {
    const nextTitle = titleDiff.after?.trim();
    return {
      type: "role_change_internal",
      confidence: 0.55,
      summary: nextTitle
        ? `Title changed to "${nextTitle}".`
        : "Current title removed from profile.",
    };
  }

  const locationDiff = diffs.find((d) => d.field === "location");
  if (locationDiff) {
    const nextLocation = locationDiff.after?.trim();
    return {
      type: "location_changed",
      confidence: 0.5,
      summary: nextLocation
        ? `Location changed to "${nextLocation}".`
        : "Location removed from profile.",
    };
  }

  const aboutDiff = diffs.find((d) => d.field === "about");
  if (aboutDiff) {
    return {
      type: "about_changed",
      confidence: 0.4,
      summary: "About section updated.",
    };
  }

  return {
    type: "other",
    confidence: 0.3,
    summary: `Profile updated (${diffs.map((d) => FIELD_LABELS[d.field] ?? d.field).join(", ")}).`,
  };
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}
