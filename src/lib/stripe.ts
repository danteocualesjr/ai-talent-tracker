import "server-only";
import Stripe from "stripe";
import type { Plan } from "@/types/db";

export { PLAN_DETAILS } from "@/lib/plans";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export const PRICE_PLAN_MAP: Record<string, { plan: Plan; profile_limit: number; cadence: "weekly" | "daily" | "hourly" }> = {
  [process.env.STRIPE_PRICE_PRO || "price_pro"]:   { plan: "pro",  profile_limit: 100,  cadence: "daily"  },
  [process.env.STRIPE_PRICE_TEAM || "price_team"]: { plan: "team", profile_limit: 1000, cadence: "hourly" },
};
