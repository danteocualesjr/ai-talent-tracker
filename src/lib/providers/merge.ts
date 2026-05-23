import type { Profile } from "@/types/db";
import type { ProviderProfile } from "./types";

/** Preserve stored fields when a provider omits nullable values (e.g. manual mode). */
export function mergeProviderProfile(profile: Profile, fetched: ProviderProfile): ProviderProfile {
  return {
    ...fetched,
    full_name: fetched.full_name ?? profile.full_name,
    headline: fetched.headline ?? profile.headline,
    current_company: fetched.current_company ?? profile.current_company,
    current_title: fetched.current_title ?? profile.current_title,
    location: fetched.location ?? profile.location,
    avatar_url: fetched.avatar_url ?? profile.avatar_url,
    about: fetched.about ?? profile.about,
    github_handle: fetched.github_handle ?? profile.github_handle,
    x_handle: fetched.x_handle ?? profile.x_handle,
  };
}
