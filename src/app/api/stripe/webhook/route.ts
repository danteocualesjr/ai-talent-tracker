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

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.created"
    ) {
      const sub = await loadSubscription(event);
      if (sub) await applySubscription(db, sub, event);
    }
    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const { error } = await db
        .from("organizations")
        .update({ plan: "free", profile_limit: 5, refresh_cadence: "weekly", stripe_subscription_id: null })
        .eq("stripe_customer_id", sub.customer as string);
      if (error) throw error;
    }
  } catch (e) {
    console.error("[stripe webhook] handler failed", e);
    return NextResponse.json({ error: "webhook handler failed" }, { status: 500 });
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

async function applySubscription(
  db: ReturnType<typeof createAdminClient>,
  sub: Stripe.Subscription,
  event: Stripe.Event,
) {
  const priceId = sub.items.data[0]?.price.id;
  if (!priceId) {
    console.error("[stripe webhook] subscription missing price", sub.id);
    throw new Error("subscription missing price");
  }

  const mapping = PRICE_PLAN_MAP[priceId];
  if (!mapping) {
    console.error("[stripe webhook] unmapped price ID", priceId);
    throw new Error(`unmapped price ID: ${priceId}`);
  }

  const update = {
    plan: mapping.plan,
    profile_limit: mapping.profile_limit,
    refresh_cadence: mapping.cadence,
    stripe_subscription_id: sub.id,
  };

  const customerId = sub.customer as string;
  const { data: updated, error } = await db
    .from("organizations")
    .update(update)
    .eq("stripe_customer_id", customerId)
    .select("id");
  if (error) throw error;
  if (updated && updated.length > 0) return;

  const orgId = await resolveOrgId(event, sub);
  if (!orgId) {
    console.error("[stripe webhook] could not resolve org for customer", customerId);
    throw new Error("could not resolve org for subscription");
  }

  const { error: fallbackError } = await db
    .from("organizations")
    .update({ ...update, stripe_customer_id: customerId })
    .eq("id", orgId);
  if (fallbackError) throw fallbackError;
}

async function resolveOrgId(event: Stripe.Event, sub: Stripe.Subscription): Promise<string | null> {
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.metadata?.org_id) return session.metadata.org_id;
  }

  const customerId = sub.customer as string;
  const customer = await stripe.customers.retrieve(customerId);
  if (!customer.deleted && customer.metadata?.org_id) return customer.metadata.org_id;

  return null;
}
