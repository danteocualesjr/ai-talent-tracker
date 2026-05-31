import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/types/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

const PRO_MAPPING = { plan: "pro" as Plan, profile_limit: 100, cadence: "daily" as const };
const TEAM_MAPPING = { plan: "team" as Plan, profile_limit: 1000, cadence: "hourly" as const };

export const PRICE_PLAN_MAP: Record<string, { plan: Plan; profile_limit: number; cadence: "weekly" | "daily" | "hourly" }> =
  Object.fromEntries(
    [
      process.env.STRIPE_PRICE_PRO ? [process.env.STRIPE_PRICE_PRO, PRO_MAPPING] : null,
      process.env.STRIPE_PRICE_TEAM ? [process.env.STRIPE_PRICE_TEAM, TEAM_MAPPING] : null,
    ].filter((e): e is [string, typeof PRO_MAPPING] => e !== null),
  );

export function getAllowedStripePriceIds(): string[] {
  return Object.keys(PRICE_PLAN_MAP);
}

export const PLAN_DETAILS: Record<Plan, { name: string; price_monthly: number; profile_limit: number; features: string[] }> = {
  free:       { name: "Free",       price_monthly: 0,    profile_limit: 5,    features: ["Public departure feed", "5 watchlist profiles", "Weekly refresh"] },
  pro:        { name: "Pro",        price_monthly: 49,   profile_limit: 100,  features: ["100 watchlist profiles", "Daily refresh", "Email + Slack alerts", "Lab rosters"] },
  team:       { name: "Team",       price_monthly: 299,  profile_limit: 1000, features: ["1,000 watchlist profiles", "Hourly refresh", "Multi-user", "Webhooks", "CSV export"] },
  enterprise: { name: "Enterprise", price_monthly: 0,    profile_limit: 10000, features: ["Custom watchlists", "API access", "ATS/CRM integrations", "SSO"] },
};
