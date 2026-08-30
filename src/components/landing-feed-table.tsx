import Link from "next/link";
import { formatRelative } from "@/lib/utils";
import { getPublicEvents } from "@/lib/queries";
import type { EventType } from "@/types/db";

const SIGNAL_LABEL: Record<EventType, string> = {
  left_company: "Left lab",
  joined_company: "Joined lab",
  went_stealth: "Went stealth",
  headline_signals_founding: "Founding signal",
  role_change_internal: "Role change",
  about_changed: "About update",
  location_changed: "Location",
  github_dark: "Multi-signal",
  new_domain: "Multi-signal",
  other: "Update",
};

const FALLBACK: Array<{
  name: string;
  role: string;
  type: EventType;
  summary: string;
  when: string;
}> = [
  {
    name: "Jane Researcher",
    role: "Member of Technical Staff · OpenAI",
    type: "went_stealth",
    summary: 'Headline now reads "Building something new."',
    when: "14m",
  },
  {
    name: "Mike Patel",
    role: "Research Engineer · Google DeepMind",
    type: "joined_company",
    summary: "Company changed to Anthropic, London",
    when: "2h",
  },
  {
    name: "Aria Chen",
    role: "Applied Scientist · Meta AI",
    type: "headline_signals_founding",
    summary: 'Headline now reads "Founding engineer at something new in AI infra."',
    when: "6h",
  },
  {
    name: "Sam Becker",
    role: "Member of Technical Staff · OpenAI",
    type: "left_company",
    summary: "Left OpenAI after 3 years",
    when: "1d",
  },
  {
    name: "Priya Singh",
    role: "Research Scientist · Anthropic",
    type: "github_dark",
    summary: "GitHub activity went dark + headline removed",
    when: "1d",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

export async function LandingFeedTable() {
  const events = await getPublicEvents(8);
  const items =
    events.length >= 4
      ? events.slice(0, 5).map((e) => ({
          name: e.profile.full_name || e.profile.linkedin_handle || "Unknown",
          role: [e.profile.current_title, e.profile.current_company].filter(Boolean).join(" · ") || "—",
          type: e.type,
          summary: e.summary,
          when: formatRelative(e.detected_at),
        }))
      : FALLBACK;

  return (
    <div className="feed-table overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border/70">
            <th className="label-caps pb-3 pr-4 font-medium">Profile</th>
            <th className="label-caps pb-3 pr-4 font-medium">Change detected</th>
            <th className="label-caps pb-3 pr-4 font-medium">Signal</th>
            <th className="label-caps pb-3 text-right font-medium">Age</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={`${item.name}-${i}`} className="group border-b border-border/50 last:border-0">
              <td className="py-4 pr-4 align-top">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-[10px] font-bold text-foreground">
                    {initials(item.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{item.role}</div>
                  </div>
                </div>
              </td>
              <td className="max-w-xs py-4 pr-4 align-top text-sm text-muted-foreground">{item.summary}</td>
              <td className="py-4 pr-4 align-top">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-signal">
                  <span className="h-1.5 w-1.5 rounded-sm bg-signal" aria-hidden />
                  {SIGNAL_LABEL[item.type]}
                </span>
              </td>
              <td className="tnum py-4 text-right align-top font-mono text-xs text-muted-foreground">{item.when}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-center md:hidden">
        <Link href="/feed" className="text-xs font-semibold text-signal hover:underline">
          View full feed →
        </Link>
      </div>
    </div>
  );
}
