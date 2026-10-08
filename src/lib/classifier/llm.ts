import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import { DIFFED_FIELDS, type FieldDiff } from "@/lib/diff";
import type { ClassifiedEvent } from "./rules";

/** Classification is a short JSON reply; anything slower is a stuck request. */
const LLM_TIMEOUT_MS = 20_000;

const SUMMARY_MAX = 280;

const PROFILE_EVENT_TYPES = [
  "left_company",
  "joined_company",
  "went_stealth",
  "headline_signals_founding",
  "role_change_internal",
  "about_changed",
  "location_changed",
  // github_dark and new_domain come from other detectors, never from a profile diff.
  "other",
] as const;

const ResponseSchema = z.object({
  type: z.enum(PROFILE_EVENT_TYPES),
  // Models sometimes answer "0.8" or 85; read both as the 0-1 score we store.
  confidence: z.preprocess((v) => {
    const n = typeof v === "string" && v.trim() !== "" ? Number(v) : v;
    return typeof n === "number" && n > 1 && n <= 100 ? n / 100 : n;
  }, z.number().min(0).max(1)),
  summary: z.string().min(1).max(SUMMARY_MAX),
  status: z.enum(["active", "left", "stealth", "founder", "unknown"]).optional(),
});

const SYSTEM = `You are a labor-market analyst classifying LinkedIn profile changes for AI lab employees. Be terse and concrete. Pay special attention to:
- "stealth", "building something", "undisclosed" headlines (went_stealth)
- "founder", "co-founder", "founding [role]" headlines (headline_signals_founding)
- Current company removed or replaced (left_company / joined_company)
Respond with a JSON object with exactly these keys:
- "type": one of ${PROFILE_EVENT_TYPES.join(", ")}
- "confidence": a number from 0 to 1
- "summary": one plain sentence, at most ${SUMMARY_MAX} characters
- "status" (optional): one of active, left, stealth, founder, unknown
Return JSON only.`;

export async function classifyWithLLM(input: {
  diffs: FieldDiff[];
  prev: Record<string, string | null>;
  next: Record<string, string | null>;
}): Promise<ClassifiedEvent | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  // Keep one slow completion from holding the Inngest step open for minutes.
  const client = new OpenAI({ apiKey: key, timeout: LLM_TIMEOUT_MS, maxRetries: 1 });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const payload = {
    diffs: input.diffs,
    before: pickDiffedFields(input.prev),
    after: pickDiffedFields(input.next),
  };

  let content: string | null | undefined;
  try {
    const resp = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(payload) },
      ],
    });
    content = resp.choices[0]?.message?.content;
  } catch (e) {
    // Fall back to the rules result instead of failing the whole refresh.
    console.warn("[llm] classification request failed", e instanceof Error ? e.message : e);
    return null;
  }
  if (!content) return null;
  try {
    const parsed = JSON.parse(content) as Record<string, unknown>;
    // A wordy but otherwise valid answer should not be thrown away over length.
    if (typeof parsed.summary === "string" && parsed.summary.length > SUMMARY_MAX) {
      parsed.summary = `${parsed.summary.slice(0, SUMMARY_MAX - 1).trimEnd()}…`;
    }
    return ResponseSchema.parse(parsed);
  } catch {
    return null;
  }
}

/**
 * Callers pass whole profile objects, including the raw provider payload.
 * Send only the compared fields so prompts stay small and raw data stays local.
 */
function pickDiffedFields(profile: Record<string, unknown>): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const field of DIFFED_FIELDS) {
    const value = profile?.[field];
    out[field] = typeof value === "string" ? value : null;
  }
  return out;
}
