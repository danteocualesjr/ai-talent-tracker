import type { Json } from "@/types/db";
import type { ProfileSnapshot } from "@/types/db";
import { humanizeLinkedInHandle } from "./utils";
import { parseProxycurlProfile, type ProxycurlResponse } from "./providers/proxycurl-parse";
import type { ProviderProfile } from "./providers/types";

/** Extract comparable profile fields from a stored snapshot payload. */
export function snapshotToPartialProfile(snapshot: ProfileSnapshot): Partial<ProviderProfile> {
  if (snapshot.source === "proxycurl") {
    return parseProxycurlRaw(snapshot.raw);
  }
  if (snapshot.source === "manual" && snapshot.raw && typeof snapshot.raw === "object") {
    const raw = snapshot.raw as { handle?: string };
    return { full_name: humanizeLinkedInHandle(raw.handle) };
  }
  return {};
}

function parseProxycurlRaw(raw: Json): Partial<ProviderProfile> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return parseProxycurlProfile(raw as ProxycurlResponse);
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
