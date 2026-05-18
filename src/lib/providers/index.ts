import { ManualProvider } from "./manual";
import { ProxycurlProvider } from "./proxycurl";
import type { ProfileProvider } from "./types";

export function getProvider(): ProfileProvider {
  const choice = (process.env.PROFILE_PROVIDER || "manual").toLowerCase();
  if (choice === "proxycurl" && process.env.PROXYCURL_API_KEY) {
    return new ProxycurlProvider(process.env.PROXYCURL_API_KEY);
  }
  return new ManualProvider();
}

export type { ProfileProvider, ProviderProfile } from "./types";
