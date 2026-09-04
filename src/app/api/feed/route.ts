import { NextResponse } from "next/server";
import { getPublicEvents } from "@/lib/queries";
import type { EventType } from "@/types/db";

const FILTER_TYPES: Record<string, EventType[]> = {
  departures: ["left_company"],
  stealth: ["went_stealth"],
  founders: ["headline_signals_founding"],
  joiners: ["joined_company"],
  github: ["github_dark"],
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);

  const events = await getPublicEvents(limit);
  const allowedTypes = type ? FILTER_TYPES[type] : undefined;
  const filtered = allowedTypes ? events.filter((e) => allowedTypes.includes(e.type)) : events;

  return NextResponse.json({
    count: filtered.length,
    events: filtered.map((e) => ({
      id: e.id,
      type: e.type,
      confidence: e.confidence,
      summary: e.summary,
      detected_at: e.detected_at,
      profile: {
        full_name: e.profile.full_name,
        linkedin_url: e.profile.linkedin_url,
        current_company: e.profile.current_company,
        headline: e.profile.headline,
      },
    })),
  });
}
