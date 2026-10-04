import type { EventType } from "@/types/db";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  left_company: "Departures",
  joined_company: "Joiners",
  went_stealth: "Stealth",
  headline_signals_founding: "Founders",
  role_change_internal: "Role change",
  about_changed: "About updated",
  location_changed: "Location",
  github_dark: "GitHub dark",
  new_domain: "New domain",
  other: "Other",
};

/** Shorter badge-friendly labels for dense UI rows. */
export const EVENT_TYPE_SHORT_LABELS: Record<EventType, string> = {
  left_company: "Left",
  joined_company: "Joined",
  went_stealth: "Stealth",
  headline_signals_founding: "Founding",
  role_change_internal: "Role",
  about_changed: "About",
  location_changed: "Location",
  github_dark: "GH dark",
  new_domain: "Domain",
  other: "Update",
};

export function labelForEventType(type: EventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}

export function shortLabelForEventType(type: EventType): string {
  return EVENT_TYPE_SHORT_LABELS[type] ?? labelForEventType(type);
}


/** Badge tone per event type for feed rows, tickers, and public event pages. */
export type EventBadgeTone = "success" | "warning" | "info" | "purple" | "secondary";

export const EVENT_TYPE_TONES: Record<EventType, EventBadgeTone> = {
  left_company: "warning",
  joined_company: "info",
  went_stealth: "warning",
  headline_signals_founding: "success",
  role_change_internal: "secondary",
  about_changed: "secondary",
  location_changed: "secondary",
  github_dark: "purple",
  new_domain: "success",
  other: "secondary",
};

export function toneForEventType(type: EventType): EventBadgeTone {
  return EVENT_TYPE_TONES[type] ?? "secondary";
}


/** URL `type=` query values used by /feed and /app/events filters. */
export const EVENT_FILTER_TYPES: Record<string, EventType[]> = {
  departures: ["left_company"],
  stealth: ["went_stealth"],
  founders: ["headline_signals_founding"],
  joiners: ["joined_company"],
  github: ["github_dark"],
  location: ["location_changed"],
  about: ["about_changed"],
  role: ["role_change_internal"],
  domain: ["new_domain"],
};

/** Short chip / status labels for those filter params. */
export const EVENT_FILTER_PARAM_LABELS: Record<string, string> = {
  departures: "Departures",
  stealth: "Stealth",
  founders: "Founders",
  joiners: "Joiners",
  github: "GitHub",
  location: "Location",
  about: "About",
  role: "Role",
  domain: "New domain",
};

/** Public-feed prose labels (lowercase phrases) for active filter status copy. */
export const EVENT_FILTER_FEED_LABELS: Record<string, string> = {
  departures: "departures",
  stealth: "stealth moves",
  founders: "founder signals",
  joiners: "joiners",
  github: "GitHub dark signals",
  location: "location changes",
  about: "about updates",
  role: "role changes",
  domain: "new domain signals",
};

/** Map a classified event type to its /app/events?type= filter param. */
export const EVENT_TYPE_TO_FILTER_PARAM: Partial<Record<EventType, string>> = {
  left_company: "departures",
  went_stealth: "stealth",
  headline_signals_founding: "founders",
  joined_company: "joiners",
  github_dark: "github",
  location_changed: "location",
  about_changed: "about",
  role_change_internal: "role",
  new_domain: "domain",
};
