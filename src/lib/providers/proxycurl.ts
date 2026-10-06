import "server-only";
import { parseProxycurlProfile, type ProxycurlResponse } from "./proxycurl-parse";
import type { ProfileProvider, ProviderProfile } from "./types";

const ENDPOINT = "https://nubela.co/proxycurl/api/v2/linkedin";

/** Fail closed so a stuck Proxycurl call cannot stall Inngest refresh jobs. */
const PROXYCURL_TIMEOUT_MS = 15_000;

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
      signal: AbortSignal.timeout(PROXYCURL_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Error pages can be large HTML; keep Inngest run logs readable.
      const body = (await res.text().catch(() => "")).slice(0, 200);
      throw new Error(`Proxycurl ${res.status}: ${body}`);
    }
    const data = (await res.json()) as ProxycurlResponse;

    return {
      linkedin_url: linkedinUrl,
      ...parseProxycurlProfile(data),
      raw: data,
    };
  }
}
