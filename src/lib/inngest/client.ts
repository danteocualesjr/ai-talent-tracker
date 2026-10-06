import { EventSchemas, Inngest } from "inngest";

export type AppEvents = {
  "profile/refresh.requested": { data: { profile_id: string; reason?: string } };
  "event/created": { data: { event_id: string } };
};

export const inngest = new Inngest({
  id: "ai-talent-tracker",
  eventKey: process.env.INNGEST_EVENT_KEY,
  // Typed payloads so a misspelled event name or missing field fails typecheck.
  schemas: new EventSchemas().fromRecord<AppEvents>(),
});
