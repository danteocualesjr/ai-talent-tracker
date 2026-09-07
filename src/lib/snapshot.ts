import type { Json } from "@/types/db";
import type { ProfileSnapshot } from "@/types/db";
import type { ProviderProfile } from "./providers/types";

interface ProxycurlExperience {
  company?: string;
  title?: string;
  ends_at?: { day: number; month: number; year: number } | null;
}

interface ProxycurlRaw {
  full_name?: string;
  headline?: string;
  occupation?: string;
  city?: string;
  state?: string;
  country_full_name?: string;
  summary?: string;
  github_profile_url?: string;
  twitter_profile_url?: string;
  experiences?: ProxycurlExperience[];
}

/** Extract comparable profile fields from a stored snapshot payload. */
export function snapshotToPartialProfile(snapshot: ProfileSnapshot): Partial<ProviderProfile> {
  if (snapshot.source === "proxycurl") {
    return parseProxycurlRaw(snapshot.raw);
  }
  if (snapshot.source === "manual" && snapshot.raw && typeof snapshot.raw === "object") {
    const raw = snapshot.raw as { handle?: string };
    const name = raw.handle
      ? raw.handle.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\d+/g, "").trim() || null
      : null;
    return { full_name: name };
  }
  return {};
}

function parseProxycurlRaw(raw: Json): Partial<ProviderProfile> {
  if (!raw || typeof raw !== "object") return {};
  const data = raw as ProxycurlRaw;
  const current = (data.experiences || []).find((e) => !e.ends_at) || (data.experiences || [])[0];

  return {
    full_name: data.full_name ?? null,
    headline: data.headline ?? data.occupation ?? null,
    current_company: current?.company ?? null,
    current_title: current?.title ?? null,
    location: [data.city, data.state, data.country_full_name].filter(Boolean).join(", ") || null,
    about: data.summary ?? null,
    github_handle: extractHandle(data.github_profile_url, "github.com"),
    x_handle: extractHandle(data.twitter_profile_url, /twitter\.com|x\.com/),
  };
}

function extractHandle(url: string | undefined, host: string | RegExp): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const matches = typeof host === "string" ? u.hostname.includes(host) : host.test(u.hostname);
    if (!matches) return null;
    const handle = u.pathname.split("/").filter(Boolean)[0];
    return handle || null;
  } catch {
    return null;
  }
}

export function toProviderProfile(partial: Partial<ProviderProfile>): ProviderProfile {
  return {
    linkedin_url: partial.linkedin_url ?? "",
    full_name: partial.full_name ?? null,
    headline: partial.headline ?? null,
    current_company: partial.current_company ?? null,
    current_title: partial.current_title ?? null,
    location: partial.location ?? null,
    avatar_url: partial.avatar_url ?? null,
    about: partial.about ?? null,
    github_handle: partial.github_handle ?? null,
    x_handle: partial.x_handle ?? null,
    raw: partial.raw ?? null,
  };
}
