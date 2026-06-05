import type { Plan } from "@/types/db";

export const PLAN_DETAILS: Record<Plan, { name: string; price_monthly: number; profile_limit: number; features: string[] }> = {
  free:       { name: "Free",       price_monthly: 0,    profile_limit: 5,    features: ["Public departure feed", "5 watchlist profiles", "Weekly refresh"] },
  pro:        { name: "Pro",        price_monthly: 49,   profile_limit: 100,  features: ["100 watchlist profiles", "Daily refresh", "Email + Slack alerts", "Lab rosters"] },
  team:       { name: "Team",       price_monthly: 299,  profile_limit: 1000, features: ["1,000 watchlist profiles", "Hourly refresh", "Multi-user", "Webhooks", "CSV export"] },
  enterprise: { name: "Enterprise", price_monthly: 0,    profile_limit: 10000, features: ["Custom watchlists", "API access", "ATS/CRM integrations", "SSO"] },
};
