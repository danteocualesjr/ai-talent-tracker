// Hand-written types mirroring supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once your project is linked.

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Plan = "free" | "pro" | "team" | "enterprise";
export type RefreshCadence = "weekly" | "daily" | "hourly";
export type ProfileStatus = "active" | "left" | "stealth" | "founder" | "unknown";
export type EventType =
  | "left_company"
  | "joined_company"
  | "went_stealth"
  | "headline_signals_founding"
  | "role_change_internal"
  | "about_changed"
  | "location_changed"
  | "github_dark"
  | "new_domain"
  | "other";
export type ChannelType = "email" | "slack" | "webhook";
export type DeliveryStatus = "queued" | "sent" | "failed" | "skipped";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  profile_limit: number;
  refresh_cadence: RefreshCadence;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface Lab {
  id: string;
  slug: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  description: string | null;
  is_featured: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  linkedin_url: string;
  linkedin_handle: string | null;
  full_name: string | null;
  headline: string | null;
  current_company: string | null;
  current_company_lab_id: string | null;
  current_title: string | null;
  location: string | null;
  avatar_url: string | null;
  github_handle: string | null;
  github_last_commit_at: string | null;
  github_commits_30d: number | null;
  x_handle: string | null;
  about: string | null;
  status: ProfileStatus;
  last_synced_at: string | null;
  next_sync_at: string | null;
  is_opted_out: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileSnapshot {
  id: string;
  profile_id: string;
  source: string;
  raw: Json;
  fetched_at: string;
  content_hash: string;
}

export interface Watchlist {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface WatchlistProfile {
  watchlist_id: string;
  profile_id: string;
  added_by: string | null;
  created_at: string;
}

export interface EventRow {
  id: string;
  profile_id: string;
  type: EventType;
  confidence: number;
  summary: string;
  before: Json | null;
  after: Json | null;
  detected_at: string;
  is_public: boolean;
}

export interface NotificationChannel {
  id: string;
  org_id: string;
  type: ChannelType;
  config: Json;
  is_active: boolean;
  event_types: EventType[];
  created_at: string;
}

export interface NotificationDelivery {
  id: string;
  channel_id: string;
  event_id: string;
  status: DeliveryStatus;
  error: string | null;
  delivered_at: string | null;
  created_at: string;
}

type Insert<T, OmitKeys extends keyof T = never> = Omit<T, OmitKeys> & Partial<Pick<T, OmitKeys>>;

export interface Database {
  public: {
    Tables: {
      organizations: { Row: Organization; Insert: Insert<Organization, "id" | "created_at" | "plan" | "profile_limit" | "refresh_cadence" | "stripe_customer_id" | "stripe_subscription_id">; Update: Partial<Organization> };
      org_members:   { Row: OrgMember;   Insert: Insert<OrgMember, "created_at" | "role">; Update: Partial<OrgMember> };
      labs:          { Row: Lab;         Insert: Insert<Lab, "id" | "created_at" | "is_featured" | "domain" | "logo_url" | "description">; Update: Partial<Lab> };
      profiles:      { Row: Profile;     Insert: Insert<Profile, "id" | "created_at" | "updated_at" | "linkedin_handle" | "status" | "is_opted_out">; Update: Partial<Profile> };
      profile_snapshots: { Row: ProfileSnapshot; Insert: Insert<ProfileSnapshot, "id" | "fetched_at">; Update: Partial<ProfileSnapshot> };
      watchlists:    { Row: Watchlist;   Insert: Insert<Watchlist, "id" | "created_at">; Update: Partial<Watchlist> };
      watchlist_profiles: { Row: WatchlistProfile; Insert: Insert<WatchlistProfile, "created_at">; Update: Partial<WatchlistProfile> };
      events:        { Row: EventRow;    Insert: Insert<EventRow, "id" | "detected_at" | "confidence" | "is_public">; Update: Partial<EventRow> };
      notification_channels: { Row: NotificationChannel; Insert: Insert<NotificationChannel, "id" | "created_at" | "is_active" | "event_types">; Update: Partial<NotificationChannel> };
      notification_deliveries: { Row: NotificationDelivery; Insert: Insert<NotificationDelivery, "id" | "created_at">; Update: Partial<NotificationDelivery> };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
