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
