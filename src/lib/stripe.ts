import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/types/db";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PRICE_PLAN_MAP: Record<string, { plan: Plan; profile_limit: number; cadence: "weekly" | "daily" | "hourly" }> = {
  [process.env.STRIPE_PRICE_PRO || "price_pro"]:   { plan: "pro",  profile_limit: 100,  cadence: "daily"  },
  [process.env.STRIPE_PRICE_TEAM || "price_team"]: { plan: "team", profile_limit: 1000, cadence: "hourly" },
};

export const ALLOWED_STRIPE_PRICE_IDS = Object.keys(PRICE_PLAN_MAP);

export const PLAN_DETAILS: Record<Plan, { name: string; price_monthly: number; profile_limit: number; features: string[] }> = {
  free:       { name: "Free",       price_monthly: 0,    profile_limit: 5,    features: ["Public departure feed", "5 watchlist profiles", "Weekly refresh"] },
  pro:        { name: "Pro",        price_monthly: 49,   profile_limit: 100,  features: ["100 watchlist profiles", "Daily refresh", "Email + Slack alerts", "Lab rosters"] },
  team:       { name: "Team",       price_monthly: 299,  profile_limit: 1000, features: ["1,000 watchlist profiles", "Hourly refresh", "Multi-user", "Webhooks", "CSV export"] },
  enterprise: { name: "Enterprise", price_monthly: 0,    profile_limit: 10000, features: ["Custom watchlists", "API access", "ATS/CRM integrations", "SSO"] },
};
