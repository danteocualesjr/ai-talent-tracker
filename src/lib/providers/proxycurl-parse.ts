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

/**
 * Map a Proxycurl payload to comparable profile fields. Shared by the live
 * provider and the snapshot history view so both read the payload the same way.
 */
export function parseProxycurlProfile(
  data: ProxycurlResponse,
): Omit<ProviderProfile, "linkedin_url" | "raw"> {
  const experiences = data.experiences || [];
  const current = experiences.find((e) => !e.ends_at) || experiences[0];

  return {
    full_name: data.full_name ?? null,
    headline: data.headline ?? data.occupation ?? null,
    current_company: current?.company ?? null,
    current_title: current?.title ?? null,
    location: [data.city, data.state, data.country_full_name].filter(Boolean).join(", ") || null,
    avatar_url: data.profile_pic_url ?? null,
    about: data.summary ?? null,
    github_handle: extractSocialHandle(data.github_profile_url, ["github.com"]),
    x_handle: extractSocialHandle(data.twitter_profile_url, ["twitter.com", "x.com"]),
  };
}
