import { ManualProvider } from "./manual";
import { ProxycurlProvider } from "./proxycurl";
import type { ProfileProvider } from "./types";

export function getProvider(): ProfileProvider {
  const choice = (process.env.PROFILE_PROVIDER || "manual").toLowerCase();
  if (choice === "proxycurl") {
    const key = process.env.PROXYCURL_API_KEY;
    if (!key) {
      throw new Error("PROXYCURL_API_KEY is required when PROFILE_PROVIDER=proxycurl");
    }
    return new ProxycurlProvider(key);
  }
  return new ManualProvider();
}

export type { ProfileProvider, ProviderProfile } from "./types";
