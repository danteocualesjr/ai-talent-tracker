import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_PLAN_MAP } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");
  if (!secret || !sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    return NextResponse.json({ error: `invalid signature: ${(e as Error).message}` }, { status: 400 });
  }

  const db = createAdminClient();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.created"
  ) {
    const sub = await loadSubscription(event);
    if (sub) await applySubscription(db, sub);
  }
  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await db
      .from("organizations")
      .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
      .eq("stripe_customer_id", sub.customer as string);
  }

  return NextResponse.json({ received: true });
}

async function loadSubscription(event: Stripe.Event): Promise<Stripe.Subscription | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (!session.subscription) return null;
    return await stripe.subscriptions.retrieve(session.subscription as string);
  }
  return event.data.object as Stripe.Subscription;
}

async function applySubscription(db: ReturnType<typeof createAdminClient>, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.warn("[stripe] subscription missing price id", sub.id);
    return;
  }
  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.warn("[stripe] unmapped price id", priceId);
    return;
  }

  const payload = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
  };

  const customerId = sub.customer as string;
  const { data, error } = await db
    .from("organizations")
    .update(payload)
    .eq("stripe_customer_id", customerId)
    .select("id");

  if (error) {
    console.error("[stripe] failed to update org for customer", customerId, error.message);
    return;
  }
  if (!data?.length) {
    const orgId = sub.metadata?.org_id;
    if (orgId) {
      const { error: fallbackErr } = await db.from("organizations").update(payload).eq("id", orgId);
      if (fallbackErr) console.error("[stripe] fallback org update failed", orgId, fallbackErr.message);
    } else {
      console.warn("[stripe] no org matched customer", customerId);
    }
  }
}
