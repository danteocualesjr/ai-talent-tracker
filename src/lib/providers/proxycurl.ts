import "server-only";
import type { ProfileProvider, ProviderProfile } from "./types";

interface ProxycurlDate {
  day: number;
  month: number;
  year: number;
}

interface ProxycurlExperience {
  company?: string;
  title?: string;
  starts_at?: ProxycurlDate | null;
  ends_at?: ProxycurlDate | null;
}

interface ProxycurlResponse {
  full_name?: string;
  headline?: string;
  occupation?: string;
  city?: string;
  state?: string;
  country_full_name?: string;
  profile_pic_url?: string;
  summary?: string;
  github_profile_url?: string;
  twitter_profile_url?: string;
  experiences?: ProxycurlExperience[];
}

const ENDPOINT = "https://nubela.co/proxycurl/api/v2/linkedin";

export class ProxycurlProvider implements ProfileProvider {
  readonly name = "proxycurl";

  constructor(private apiKey: string) {}

  async fetch(linkedinUrl: string): Promise<ProviderProfile> {
    const url = new URL(ENDPOINT);
    url.searchParams.set("url", linkedinUrl);
    url.searchParams.set("use_cache", "if-recent");
    url.searchParams.set("fallback_to_cache", "on-error");

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Proxycurl ${res.status}: ${await res.text()}`);
    }
    const data = (await res.json()) as ProxycurlResponse;

    const current = pickCurrentExperience(data.experiences ?? []);

    return {
      linkedin_url: linkedinUrl,
      full_name: data.full_name ?? null,
      headline: data.headline ?? data.occupation ?? null,
      current_company: current?.company ?? null,
      current_title: current?.title ?? null,
      location: [data.city, data.state, data.country_full_name].filter(Boolean).join(", ") || null,
      avatar_url: data.profile_pic_url ?? null,
      about: data.summary ?? null,
      github_handle: extractHandle(data.github_profile_url, "github.com"),
      x_handle: extractHandle(data.twitter_profile_url, /twitter\.com|x\.com/),
      raw: data,
    };
  }
}

function pickCurrentExperience(experiences: ProxycurlExperience[]): ProxycurlExperience | undefined {
  const active = experiences.filter((e) => !e.ends_at);
  if (active.length === 0) return undefined;
  return active.reduce((best, e) => (dateValue(e.starts_at) > dateValue(best.starts_at) ? e : best));
}

function dateValue(d: ProxycurlDate | null | undefined): number {
  if (!d) return 0;
  return d.year * 10000 + d.month * 100 + d.day;
}

function extractHandle(url: string | undefined, host: string | RegExp): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const matches = typeof host === "string" ? u.hostname.includes(host) : host.test(u.hostname);
    if (!matches) return null;
    const handle = u.pathname.split("/").filter(Boolean)[0];
    return handle ? handle.toLowerCase() : null;
  } catch {
    return null;
  }
}
