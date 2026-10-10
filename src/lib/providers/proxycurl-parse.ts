import { extractSocialHandle } from "@/lib/utils";
import type { ProviderProfile } from "./types";

interface ProxycurlExperience {
  company?: string;
  title?: string;
  ends_at?: { day: number; month: number; year: number } | null;
}

export interface ProxycurlResponse {
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

/** Blank strings from the provider count as missing, so they never mask a fallback or look like an edit. */
function clean(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Map a Proxycurl payload to comparable profile fields. Shared by the live
 * provider and the snapshot history view so both read the payload the same way.
 */
export function parseProxycurlProfile(
  data: ProxycurlResponse,
): Omit<ProviderProfile, "linkedin_url" | "raw"> {
  const experiences = data.experiences || [];
  // When every role has an end date the person has no current employer; falling
  // back to the latest past job hid departures from the left_company rule.
  const current = experiences.find((e) => !e.ends_at);

  return {
    full_name: clean(data.full_name),
    // An empty headline should fall back to the occupation, not hide it.
    headline: clean(data.headline) ?? clean(data.occupation),
    current_company: clean(current?.company),
    current_title: clean(current?.title),
    location: [data.city, data.state, data.country_full_name].map(clean).filter(Boolean).join(", ") || null,
    avatar_url: clean(data.profile_pic_url),
    about: clean(data.summary),
    github_handle: extractSocialHandle(data.github_profile_url, ["github.com"]),
    x_handle: extractSocialHandle(data.twitter_profile_url, ["twitter.com", "x.com"]),
  };
}
