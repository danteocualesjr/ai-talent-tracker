import type { FieldDiff } from "@/lib/diff";
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

  for (const re of STEALTH_PATTERNS) {
    if (re.test(headline)) {
      return {
        type: "went_stealth",
        confidence: 0.9,
        status: "stealth",
        summary: `Headline now reads "${headline}" — stealth signal.`,
      };
    }
  }

  for (const re of FOUNDER_PATTERNS) {
    if (re.test(headline)) {
      return {
        type: "headline_signals_founding",
        confidence: 0.85,
        status: "founder",
        summary: `Headline now reads "${headline}" — founding signal.`,
      };
    }
  }

  for (const re of STAFF_FOUNDING_PATTERNS) {
    if (re.test(headline)) {
      return {
        type: "headline_signals_founding",
        confidence: 0.7,
        status: "founder",
        summary: `Headline now reads "${headline}" — founding-team signal.`,
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

  return {
    type: "other",
    confidence: 0.3,
    summary: `Profile updated (${diffs.map((d) => d.field).join(", ")}).`,
  };
}

function norm(s: string): string {
  return s.trim().toLowerCase();
}
