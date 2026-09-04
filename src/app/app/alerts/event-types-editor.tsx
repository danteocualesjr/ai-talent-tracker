"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateChannelEventTypes } from "./actions";
import type { EventType } from "@/types/db";
import { cn } from "@/lib/utils";

const EVENT_TYPE_OPTIONS: { value: EventType; label: string }[] = [
  { value: "left_company", label: "Departures" },
  { value: "joined_company", label: "Joiners" },
  { value: "went_stealth", label: "Stealth" },
  { value: "headline_signals_founding", label: "Founders" },
  { value: "github_dark", label: "GitHub dark" },
  { value: "role_change_internal", label: "Role change" },
  { value: "about_changed", label: "About changed" },
  { value: "location_changed", label: "Location" },
  { value: "new_domain", label: "New domain" },
];

const EVENT_TYPE_PRESETS: { label: string; types: EventType[] }[] = [
  { label: "Stealth + founders", types: ["went_stealth", "headline_signals_founding"] },
  { label: "Departures only", types: ["left_company"] },
  { label: "All signals", types: EVENT_TYPE_OPTIONS.map((o) => o.value) },
];

export function EventTypesEditor({ channelId, eventTypes }: { channelId: string; eventTypes: EventType[] }) {
  const [pending, start] = useTransition();
  const selected = new Set(eventTypes);

  function toggleType(type: EventType) {
    const next = new Set(selected);
    if (next.has(type)) {
      if (next.size === 1) {
        toast.error("At least one event type must be selected.");
        return;
      }
      next.delete(type);
    } else {
      next.add(type);
    }

    const formData = new FormData();
    formData.set("id", channelId);
    formData.set("event_types", JSON.stringify([...next]));
    start(async () => {
      const res = await updateChannelEventTypes(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Event types updated.");
      }
    });
  }

  function applyPreset(types: EventType[]) {
    const formData = new FormData();
    formData.set("id", channelId);
    formData.set("event_types", JSON.stringify(types));
    start(async () => {
      const res = await updateChannelEventTypes(formData);
      if ("error" in res) toast.error(res.error);
      else toast.success("Preset applied.");
    });
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {EVENT_TYPE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            disabled={pending}
            onClick={() => applyPreset(preset.types)}
            className="rounded-full border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-signal/30 hover:text-foreground"
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Event types">
      {EVENT_TYPE_OPTIONS.map(({ value, label }) => {
        const active = selected.has(value);
        return (
          <button
            key={value}
            type="button"
            disabled={pending}
            aria-pressed={active}
            onClick={() => toggleType(value)}
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
              active
                ? "border-signal/40 bg-signal/10 text-foreground"
                : "border-border/60 bg-muted/40 text-muted-foreground hover:border-border hover:text-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
