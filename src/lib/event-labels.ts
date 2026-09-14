import type { EventType } from "@/types/db";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  left_company: "Departures",
  joined_company: "Joiners",
  went_stealth: "Stealth",
  headline_signals_founding: "Founders",
  role_change_internal: "Role change",
  about_changed: "About changed",
  location_changed: "Location",
  github_dark: "GitHub dark",
  new_domain: "New domain",
  other: "Other",
};

export function labelForEventType(type: EventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}
