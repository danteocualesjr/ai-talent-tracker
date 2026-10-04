/** Shared filter chip params used by /feed and /app/events toolbars. */

export const EVENT_FILTER_CHIP_PARAMS = [
  null,
  "departures",
  "stealth",
  "founders",
  "joiners",
  "github",
  "location",
  "about",
  "role",
  "domain",
] as const;

export type EventFilterChipParam = (typeof EVENT_FILTER_CHIP_PARAMS)[number];

export const EVENT_FILTER_CHIP_LABELS: Record<Exclude<EventFilterChipParam, null> | "all", string> = {
  all: "All",
  departures: "Departures",
  stealth: "Stealth",
  founders: "Founders",
  joiners: "Joiners",
  github: "GitHub",
  location: "Location",
  about: "About",
  role: "Role",
  domain: "Domain",
};

export function labelForFilterChipParam(param: EventFilterChipParam): string {
  return param ? EVENT_FILTER_CHIP_LABELS[param] : EVENT_FILTER_CHIP_LABELS.all;
}
