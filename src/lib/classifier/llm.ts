import "server-only";
import OpenAI from "openai";
import { z } from "zod";
import type { FieldDiff } from "@/lib/diff";
import type { ClassifiedEvent } from "./rules";

const ResponseSchema = z.object({
  type: z.enum([
    "left_company",
    "joined_company",
    "went_stealth",
    "headline_signals_founding",
    "role_change_internal",
    "about_changed",
    "location_changed",
    "github_dark",
    "new_domain",
    "other",
  ]),
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1).max(280),
  status: z.enum(["active", "left", "stealth", "founder", "unknown"]).optional(),
});

const SYSTEM = `You are a labor-market analyst classifying LinkedIn profile changes for AI lab employees. Be terse and concrete. Pay special attention to:
- "stealth", "building something", "undisclosed" headlines (went_stealth)
- "founder", "co-founder", "founding [role]" headlines (headline_signals_founding)
- Current company removed or replaced (left_company / joined_company)
Return JSON only.`;

export async function classifyWithLLM(input: {
  diffs: FieldDiff[];
  prev: Record<string, string | null>;
  next: Record<string, string | null>;
}): Promise<ClassifiedEvent | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const client = new OpenAI({ apiKey: key });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const payload = {
    diffs: input.diffs,
    before: input.prev,
    after: input.next,
  };

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

    const content = resp.choices[0]?.message?.content;
    if (!content) return null;
    return ResponseSchema.parse(JSON.parse(content));
  } catch (e) {
    console.warn("[llm] classification failed, falling back to rules", e);
    return null;
  }
}
