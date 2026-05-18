import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "ai-talent-tracker",
  eventKey: process.env.INNGEST_EVENT_KEY,
});

export type AppEvents = {
  "profile/refresh.requested": { data: { profile_id: string; reason?: string } };
  "profile/snapshot.created": { data: { profile_id: string; snapshot_id: string } };
  "event/created": { data: { event_id: string } };
};
