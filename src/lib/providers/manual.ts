import type { ProfileProvider, ProviderProfile } from "./types";

/**
 * Manual / no-op provider. Returns whatever metadata the user supplied at
 * creation time. Useful for dev without a paid API key and as a fallback
 * before scheduled refreshes are wired up.
 */
export class ManualProvider implements ProfileProvider {
  readonly name = "manual";

  async fetch(linkedinUrl: string): Promise<ProviderProfile> {
    const handle = linkedinUrl
      .replace(/\/$/, "")
      .split("/in/")[1]
      ?.split(/[/?#]/)[0] ?? "";
    return {
      linkedin_url: linkedinUrl,
      full_name: humanize(handle),
      headline: null,
      current_company: null,
      current_title: null,
      location: null,
      avatar_url: null,
      about: null,
      github_handle: null,
      x_handle: null,
      raw: { source: "manual", handle },
    };
  }
}

function humanize(handle: string): string | null {
  if (!handle) return null;
  return handle
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\d+/g, "")
    .trim() || null;
}
